#!/usr/bin/env python3
"""Add the ABC Tools Chinese UI and MusicXML export patch to a project."""

from __future__ import annotations

import argparse
import ast
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import socket
import sys
import tempfile
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit, urlunsplit
from urllib.request import Request, urlopen


PAGE_NAMES = (
    "abctools-offline.html",
    "abctools.html",
    "abctools-quick-editor.html",
    "abctools-quick-editor-offline.html",
)
SHARED_SCRIPT = "interface-language.js"
LANGUAGE_CONTROL = """<div style="float:right;display:flex;align-items:center;gap:6px;margin:8px 12px 0 8px;font-family:Arial,sans-serif;font-size:10pt;">
\t<label for="ui-language">Language</label>
\t<select id="ui-language" aria-label="Interface language" onchange="SetInterfaceLanguage(this.value)">
\t\t<option value="en">English</option>
\t\t<option value="zh-CN">简体中文</option>
\t</select>
</div>"""
XML_BUTTON = '<input style="margin-right:8px" class="btn btn-top" id="saveasxml" onclick="ExportCurrentTuneAsMusicXML();" type="button" value="Export XML" title="Exports the selected tune as a MusicXML file using abc2xml"/>'
QUICK_XML_BUTTON = XML_BUTTON.replace("margin-right:8px", "margin-right:24px")
SHARED_SCRIPT_TAG = (
    '<script type="text/javascript" src="interface-language.js?v=3355">'
    "</script><!-- shared interface translations and MusicXML export -->"
)
CHAT_COMPLETIONS_SUFFIX = "/chat/completions"
UI_STRING_RE = re.compile(r"""(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')""")


class VisibleTextParser(HTMLParser):
    """Collect translatable page text and labels without reading ABC input."""

    excluded = {"script", "style", "textarea", "code", "pre", "svg"}
    translatable_attributes = {"title", "placeholder", "aria-label", "value"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.excluded_depth = 0
        self.values: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in self.excluded:
            self.excluded_depth += 1
        if self.excluded_depth:
            return
        for name, value in attrs:
            if name in self.translatable_attributes and value:
                self._add(value)

    def handle_endtag(self, tag: str) -> None:
        if tag in self.excluded and self.excluded_depth:
            self.excluded_depth -= 1

    def handle_data(self, data: str) -> None:
        if not self.excluded_depth:
            self._add(data)

    def _add(self, value: str) -> None:
        text = " ".join(value.split())
        if is_candidate(text):
            self.values.add(text)


def is_candidate(text: str) -> bool:
    if not (3 <= len(text) <= 180) or "\n" in text or "\r" in text:
        return False
    if not re.search(r"[A-Za-z]", text) or not re.search(r"\s", text):
        return False
    if re.search(r"https?://|www\.|[{}$]|</|/>", text, re.IGNORECASE):
        return False
    if re.search(r"(?:^|\s)[XTMLKVQRPWBNw]:\s*\S", text):
        return False
    return True


def extract_translations(script_text: str) -> tuple[int, int]:
    marker = re.search(r"\bvar\s+translations\s*=\s*\{", script_text)
    if not marker:
        raise ValueError("The shared language script has no translations object.")

    start = marker.end() - 1
    quote: str | None = None
    escaped = False
    depth = 0
    end = -1
    for index in range(start, len(script_text)):
        char = script_text[index]
        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
            continue
        if char in "\"'":
            quote = char
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                end = index
                break
    if end < 0:
        raise ValueError("The translations object is incomplete.")

    object_body = script_text[start + 1:end]
    keys = set()
    for match in re.finditer(r"""(?m)^\s*("(?:\\.|[^"\\])*")\s*:""", object_body):
        keys.add(json.loads(match.group(1)))
    return end, len(keys)


def insert_translations(script_text: str, additions: dict[str, str]) -> str:
    if not additions:
        return script_text
    end, _ = extract_translations(script_text)
    entries = ",\n".join(
        f"                {json.dumps(key, ensure_ascii=False)}: "
        f"{json.dumps(value, ensure_ascii=False)}"
        for key, value in sorted(additions.items())
    )
    body_before = script_text[:end].rstrip()
    separator = "" if body_before.endswith(("{", ",")) else ","
    return f"{body_before}{separator}\n{entries}\n{script_text[end:]}"


def extract_candidates(project_dir: Path, script_text: str) -> list[str]:
    parser = VisibleTextParser()
    for page_name in PAGE_NAMES:
        page = project_dir / page_name
        if page.exists():
            parser.feed(page.read_text(encoding="utf-8"))

    app_js = project_dir / "app.js"
    if app_js.exists():
        for match in UI_STRING_RE.finditer(app_js.read_text(encoding="utf-8")):
            raw = match.group(1) if match.group(1) is not None else match.group(2)
            try:
                value = json.loads(f'"{raw}"') if match.group(1) is not None else decode_js_single_quoted(raw)
            except (ValueError, json.JSONDecodeError):
                continue
            value = " ".join(value.split())
            if is_candidate(value):
                parser.values.add(value)

    _, _ = extract_translations(script_text)
    existing_keys = extract_translation_keys(script_text)
    return sorted(value for value in parser.values if value not in existing_keys)


def decode_js_single_quoted(value: str) -> str:
    return ast.literal_eval("'" + value + "'")


def extract_translation_keys(script_text: str) -> set[str]:
    marker = re.search(r"\bvar\s+translations\s*=\s*\{", script_text)
    if not marker:
        raise ValueError("The shared language script has no translations object.")
    start = marker.end() - 1
    quote: str | None = None
    escaped = False
    depth = 0
    end = -1
    for index in range(start, len(script_text)):
        char = script_text[index]
        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
        elif char in "\"'":
            quote = char
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                end = index
                break
    if end < 0:
        raise ValueError("The translations object is incomplete.")
    body = script_text[start + 1:end]
    return {
        json.loads(match.group(1))
        for match in re.finditer(r"""(?m)^\s*("(?:\\.|[^"\\])*")\s*:""", body)
    }


def extract_translation_map(script_text: str) -> dict[str, str]:
    end, _ = extract_translations(script_text)
    marker = re.search(r"\bvar\s+translations\s*=\s*\{", script_text)
    assert marker is not None
    body = script_text[marker.end():end]
    result = {}
    pattern = re.compile(
        r"""(?m)^\s*("(?:\\.|[^"\\])*")\s*:\s*("(?:\\.|[^"\\])*")\s*,?"""
    )
    for match in pattern.finditer(body):
        result[json.loads(match.group(1))] = json.loads(match.group(2))
    return result


def loopback_api_url(value: str) -> str:
    parsed = urlsplit(value)
    if parsed.scheme != "http" or not parsed.hostname:
        raise ValueError("The AI endpoint must be a local HTTP URL.")
    try:
        addresses = {item[4][0] for item in socket.getaddrinfo(parsed.hostname, parsed.port or 80)}
    except OSError as error:
        raise ValueError(f"Cannot resolve the local AI host: {error}") from error
    if not addresses or any(not address.startswith("127.") and address != "::1" for address in addresses):
        raise ValueError("For privacy, the AI endpoint must resolve to localhost or 127.0.0.1.")
    return value.rstrip("/")


def model_name(api_url: str, requested: str) -> str:
    if requested:
        return requested
    parsed = urlsplit(api_url)
    models_url = urlunsplit((parsed.scheme, parsed.netloc, "/v1/models", "", ""))
    try:
        with urlopen(Request(models_url, method="GET"), timeout=5) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, OSError, ValueError, json.JSONDecodeError) as error:
        raise RuntimeError(
            f"Could not detect a local model from /v1/models: {error}. "
            "Specify the model explicitly with --model."
        ) from error
    models = data.get("data", [])
    available = [
        model for model in models
        if isinstance(model, dict) and isinstance(model.get("id"), str)
    ]
    loaded = [
        model for model in available
        if isinstance(model.get("status"), dict)
        and model["status"].get("value") == "loaded"
    ]
    if loaded:
        return loaded[0]["id"]
    if available:
        return available[0]["id"]
    raise RuntimeError("The local /v1/models endpoint returned no model; specify one with --model.")


def request_translations(
    phrases: list[str],
    api_url: str,
    model: str,
    api_key: str | None,
) -> dict[str, str]:
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    system = (
        "你是熟悉 ABC 记谱法、MusicXML、乐理和乐器指法的简体中文音乐软件本地化专家。"
        "把给定英文界面短语准确译为简体中文，使用规范音乐术语。"
        "逐字保留 ABC 字段代码（如 X:、T:、M:、L:、K:、V:）、MIDI、MusicXML、"
        "音名、调号代码、占位符、快捷键和文件扩展名。"
        "只返回一个 JSON 对象，键必须逐字对应输入，值为译文；不要解释，不要添加键。"
    )
    output: dict[str, str] = {}
    endpoint = api_url.rstrip("/")
    if not endpoint.endswith(CHAT_COMPLETIONS_SUFFIX):
        parsed = urlsplit(endpoint)
        path = parsed.path.rstrip("/")
        if not path:
            path = "/v1"
        endpoint = urlunsplit((parsed.scheme, parsed.netloc, path + CHAT_COMPLETIONS_SUFFIX, "", ""))

    for offset in range(0, len(phrases), 50):
        batch = phrases[offset:offset + 50]
        payload = {
            "model": model,
            "temperature": 0,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": json.dumps(batch, ensure_ascii=False)},
            ],
        }
        request = Request(
            endpoint,
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers=headers,
            method="POST",
        )
        try:
            with urlopen(request, timeout=120) as response:
                response_data = json.loads(response.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError, OSError, json.JSONDecodeError) as error:
            raise RuntimeError(f"Local LLM request failed: {error}") from error

        try:
            content = response_data["choices"][0]["message"]["content"]
            content = re.sub(r"^\s*```(?:json)?\s*|\s*```\s*$", "", content, flags=re.IGNORECASE)
            translations = json.loads(content)
        except (KeyError, IndexError, TypeError, json.JSONDecodeError) as error:
            raise RuntimeError("Local LLM returned an invalid JSON translations object.") from error
        if not isinstance(translations, dict):
            raise RuntimeError("Local LLM response must be a JSON object.")
        for phrase in batch:
            translated = translations.get(phrase)
            if not isinstance(translated, str) or not translated.strip():
                raise RuntimeError(f"Local LLM omitted a valid translation for: {phrase}")
            if not re.search(r"[\u3400-\u9fff]", translated):
                raise RuntimeError(f"Translation is not Simplified Chinese: {phrase}")
            output[phrase] = translated.strip()
    return output


def insert_once(text: str, pattern: str, insertion: str, description: str) -> tuple[str, bool]:
    if "id=\"ui-language\"" in text:
        return text, False
    result, count = re.subn(pattern, lambda match: match.group(0) + insertion, text, count=1, flags=re.MULTILINE)
    if count != 1:
        raise ValueError(f"Could not locate the {description} insertion point.")
    return result, True


def patch_page(text: str, page_name: str) -> tuple[str, list[str]]:
    changes: list[str] = []
    text, changed = insert_once(
        text,
        r"<div\s+id=\"topbar\"\s*>",
        "\n\n\t\t\t\t\t\t" + LANGUAGE_CONTROL.replace("\n", "\n\t\t\t\t\t\t"),
        "top bar",
    )
    if changed:
        changes.append("language selector")

    if 'id="saveasxml"' not in text:
        save_button = re.search(r"<input\b(?=[^>]*\bid=\"saveabcfile\")[^>]*?/?>", text)
        if not save_button:
            raise ValueError(f"{page_name}: could not locate the ABC Save button.")
        button = QUICK_XML_BUTTON if "quick-editor" in page_name else XML_BUTTON
        text = text[:save_button.end()] + "\n\t\t\t\t\t\t" + button + text[save_button.end():]
        changes.append("MusicXML export button")

    if SHARED_SCRIPT_TAG not in text:
        app_script = re.search(
            r'<script\b(?=[^>]*\bsrc="app-min\.js(?:\?[^"]*)?")[^>]*></script>'
            r'\s*<!--\s*main application business logic\s*-->',
            text,
        )
        if not app_script:
            raise ValueError(f"{page_name}: could not locate the main application script.")
        text = text[:app_script.end()] + "\n\t" + SHARED_SCRIPT_TAG + text[app_script.end():]
        changes.append("shared localization script")
    return text, changes


def patch_service_worker(text: str) -> tuple[str, list[str]]:
    changes: list[str] = []
    cache_list = re.search(r"const\s+contentToCache\s*=\s*\[", text)
    if not cache_list:
        raise ValueError("Could not locate the service worker cache manifest.")
    if re.search(r"""['"]interface-language\.js['"]""", text) is None:
        text = text[:cache_list.end()] + "\n    'interface-language.js'," + text[cache_list.end():]
        changes.append("offline cache entry")
    if changes:
        cache_name = re.search(r"""(const\s+cacheName\s*=\s*['"]abctoolscache-)(\d+)(['"])""", text)
        if cache_name:
            updated = str(int(cache_name.group(2)) + 1)
            text = text[:cache_name.start(2)] + updated + text[cache_name.end(2):]
            changes.append(f"cache version {cache_name.group(2)} -> {updated}")
    return text, changes


def write_atomic(path: Path, content: str) -> None:
    data = content.encode("utf-8")
    descriptor, temporary_name = tempfile.mkstemp(prefix=path.name + ".", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(descriptor, "wb") as temporary:
            temporary.write(data)
            temporary.flush()
            os.fsync(temporary.fileno())
        os.replace(temporary_name, path)
    except BaseException:
        try:
            os.unlink(temporary_name)
        except FileNotFoundError:
            pass
        raise


def read_text_preserving_newlines(path: Path) -> str:
    with path.open("r", encoding="utf-8", newline="") as source:
        return source.read()


def build_changes(
    project_dir: Path,
    template_path: Path,
    use_ai: bool,
    api_url: str,
    requested_model: str,
    api_key: str | None,
) -> tuple[dict[Path, str], dict[str, str], list[tuple[str, list[str]]]]:
    missing = [name for name in PAGE_NAMES if not (project_dir / name).is_file()]
    if missing:
        raise FileNotFoundError("Required ABC Tools pages are missing: " + ", ".join(missing))
    if not template_path.is_file():
        raise FileNotFoundError(f"Bundled translation script was not found: {template_path}")

    script_path = project_dir / SHARED_SCRIPT
    script_text = (
        read_text_preserving_newlines(script_path)
        if script_path.is_file()
        else read_text_preserving_newlines(template_path)
    )
    original_script_text = script_text
    extract_translations(script_text)
    known_translations = extract_translation_map(read_text_preserving_newlines(template_path))
    existing_translations = extract_translation_map(script_text)
    dictionary_additions = {
        key: value for key, value in known_translations.items()
        if key not in existing_translations
    }
    script_text = insert_translations(script_text, dictionary_additions)
    ai_additions: dict[str, str] = {}
    if use_ai:
        safe_url = loopback_api_url(api_url)
        candidates = extract_candidates(project_dir, script_text)
        if candidates:
            chosen_model = model_name(safe_url, requested_model)
            ai_additions = request_translations(candidates, safe_url, chosen_model, api_key)
            script_text = insert_translations(script_text, ai_additions)
            print(f"Translated {len(ai_additions)} previously untranslated UI phrases with local model {chosen_model}.")
        else:
            print("No new UI phrases need translation.")

    outputs: dict[Path, str] = {}
    reports: list[tuple[str, list[str]]] = []
    for name in PAGE_NAMES:
        path = project_dir / name
        original = read_text_preserving_newlines(path)
        patched, changes = patch_page(original, name)
        outputs[path] = patched
        reports.append((name, changes))

    worker = project_dir / "service_worker.js"
    if worker.is_file():
        original_worker = read_text_preserving_newlines(worker)
        patched_worker, worker_changes = patch_service_worker(original_worker)
        outputs[worker] = patched_worker
        reports.append(("service_worker.js", worker_changes))
    outputs[script_path] = script_text
    script_status = []
    if not script_path.exists():
        script_status.append("created")
    elif script_text != original_script_text:
        script_status.append(
            f"added {len(dictionary_additions)} built-in and {len(ai_additions)} AI translations"
        )
    reports.append((SHARED_SCRIPT, script_status))
    return outputs, ai_additions, reports


def parse_args(argv: Iterable[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Apply the ABC Tools Simplified Chinese and MusicXML export patch."
    )
    parser.add_argument("--project-dir", type=Path, default=Path.cwd(), help="ABC Tools project directory (default: current directory)")
    parser.add_argument("--ai", action="store_true", help="Use the local OpenAI-compatible LLM to translate new UI text")
    parser.add_argument("--api-url", default="http://127.0.0.1:8085/v1/chat/completions", help="Local chat-completions endpoint")
    parser.add_argument("--model", default="", help="Model name; defaults to a loaded model from /v1/models")
    parser.add_argument("--api-key", default=os.environ.get("OPENAI_API_KEY", ""), help="Optional local server API key")
    parser.add_argument("--dry-run", action="store_true", help="Report changes without writing files")
    parser.add_argument("--offline-only", action="store_true", help=argparse.SUPPRESS)
    return parser.parse_args(argv)


def bundled_template_path() -> Path:
    if getattr(sys, "frozen", False):
        return Path(getattr(sys, "_MEIPASS")) / SHARED_SCRIPT
    return Path(__file__).resolve().with_name(SHARED_SCRIPT)


def main(argv: Iterable[str] | None = None) -> int:
    args = parse_args(argv)
    executable_is_offline = getattr(sys, "frozen", False) and "offline" in Path(sys.executable).stem.lower()
    if (args.offline_only or executable_is_offline) and args.ai:
        print("This offline-only build cannot call an AI model.", file=sys.stderr)
        return 2
    project_dir = args.project_dir.resolve()
    try:
        outputs, additions, reports = build_changes(
            project_dir,
            bundled_template_path(),
            args.ai,
            args.api_url,
            args.model,
            args.api_key or None,
        )
    except (FileNotFoundError, ValueError, RuntimeError, OSError) as error:
        print(f"Patch failed: {error}", file=sys.stderr)
        return 1

    print(f"Project: {project_dir}")
    for filename, changes in reports:
        print(f"  {filename}: {', '.join(changes) if changes else 'already up to date'}")
    if additions:
        print(f"AI translation entries to add: {len(additions)}")
    if args.dry_run:
        print("Dry run only; no files were changed.")
        return 0

    try:
        for path, content in outputs.items():
            if not path.exists() or read_text_preserving_newlines(path) != content:
                write_atomic(path, content)
    except OSError as error:
        print(f"Failed to write patch files: {error}", file=sys.stderr)
        return 1
    print("Patch applied successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
