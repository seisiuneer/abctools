# ABC Tools 汉化与 MusicXML 补丁工具

该工具为 ABC Tools 项目中的四个主页面添加界面语言切换和 MusicXML 导出，并更新离线缓存清单：

- `abctools.html`
- `abctools-offline.html`
- `abctools-quick-editor.html`
- `abctools-quick-editor-offline.html`

补丁器会保留现有翻译，并合并内置的简体中文音乐术语词典。离线版本不联网、不调用 AI；可选 AI 版本仅在显式指定 `--ai` 时，将尚未收录的界面短语发送到本机 OpenAI 兼容服务。ABC 编辑区、乐谱正文和用户曲目不会作为翻译候选发送。

## 使用可执行文件

将可执行文件放在任意位置，指定 ABC Tools 项目目录：

```powershell
.\ABCToolsPatchOffline.exe --project-dir "D:\path\to\ABCTools" --dry-run
.\ABCToolsPatchOffline.exe --project-dir "D:\path\to\ABCTools"
```

确认 dry-run 输出的变更后，再去掉 `--dry-run` 执行写入。建议先备份项目。补丁可重复运行；已完成的页面更新不会重复添加。

`ABCToolsPatch.exe` 默认同样完全离线。仅需翻译词典尚未包含的新界面文字时，才指定本机模型：

```powershell
.\ABCToolsPatch.exe --project-dir "D:\path\to\ABCTools" --ai --dry-run
.\ABCToolsPatch.exe --project-dir "D:\path\to\ABCTools" --ai --model "你的本地模型名"
```

默认 API 地址为 `http://127.0.0.1:8085/v1/chat/completions`，并从 `/v1/models` 自动读取模型名。也可指定 `--api-url`、`--model` 和 `--api-key`；令牌也可通过 `OPENAI_API_KEY` 环境变量提供。出于隐私保护，AI 地址仅允许解析到本机回环地址。

## 从 Python 运行或重新构建

Python 源码无需额外依赖即可执行离线补丁：

```powershell
python .\patch_abctools.py --project-dir "D:\path\to\ABCTools" --dry-run
python .\patch_abctools.py --project-dir "D:\path\to\ABCTools"
```

运行 AI 翻译时显式增加 `--ai`。构建两个单文件 EXE 需要已安装 Python 和 PyInstaller：

```powershell
.\build-patcher.ps1
```

默认输出：

- `dist\ABCToolsPatch.exe`：可选本机 AI 翻译。
- `dist\ABCToolsPatchOffline.exe`：仅离线，不接受 `--ai`。

离线模式使用随工具打包的术语词典；词典未收录的全新短语不会由离线工具自动创造译文，可通过 AI 模式补充，或手动扩充项目的 `interface-language.js`。
