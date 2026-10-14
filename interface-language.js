(function() {
  window.ExportCurrentTuneAsMusicXML = function() {
  			var theTune = findSelectedTune();
  
  			if (!theTune) {
  				var thePrompt = makeCenteredPromptString("Please select or enter an ABC tune before exporting MusicXML.");
  				DayPilot.Modal.alert(thePrompt, {
  					theme: "modal_flat",
  					top: 200,
  					scrollWithPage: AllowDialogsToScroll()
  				});
  				return;
  			}
  
  			var sourceName = (typeof gDisplayedName === "string") ? gDisplayedName.trim() : "";
  			if (sourceName === "No ABC file selected") {
  				sourceName = "";
  			} else if (sourceName) {
  				sourceName = sourceName
  					.replace(/\s*\+\s*added tunes.*$/i, "")
  					.replace(/\.[^.]+$/, "")
  					.trim();
  				sourceName = sourceName
  					.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
  					.replace(/[. ]+$/g, "")
  					.trim();
  			}
  
  			ExportMusicXML(
  				theTune,
  				sourceName ? sourceName + ".xml" : GetTuneAudioDownloadName(theTune, ".xml"),
  				function() {},
  				function() {
  					var thePrompt = makeCenteredPromptString("There was an issue converting the ABC to MusicXML.");
  					DayPilot.Modal.alert(thePrompt, {
  						theme: "modal_flat",
  						top: 200,
  						scrollWithPage: AllowDialogsToScroll()
  					});
  				}
  			);
  		};

  (function() {
  			var translations = {
  				"ABC Transcription Tools Quick Editor": "ABC 乐谱工具快速编辑器",
  				"ABC Transcription Tools": "ABC 乐谱工具",
  				"Get help using the ABC Transcription Tools": "查看 ABC 乐谱工具的使用帮助",
  				"Play the current tune.  Shift-click to open the current tune in the Tune Trainer.": "播放当前曲目。按住 Shift 点击，可在曲目练习器中打开当前曲目。",
  				"Export the tunes as a PDF tunebook": "将曲目集导出为 PDF 曲集",
  				"Toggles between showing the ABC editor and displaying the notation full screen.  Alt-click to hide/show all corner buttons and enter Presentation mode.": "切换 ABC 编辑器与全屏五线谱视图。按住 Alt 点击可隐藏或显示角落按钮并进入演示模式。",
  				"Opens up the Jump to Tune dialog": "打开跳转至曲目对话框",
  				"Opens an existing ABC, MusicXML, BWW, or MIDI file.  You may also drag-and-drop ABC, MusicXML, BWW, or MIDI files on the editor area to add them.": "打开现有的 ABC、MusicXML、BWW 或 MIDI 文件。也可将这些文件拖放到编辑区进行添加。",
  				"Add your own tunes, restore from a saved snapshot, seach for tunes, re-order tunes, delete tunes, or add examples tunes and song templates to the ABC": "添加曲目、从快照恢复、搜索曲目、调整曲目顺序、删除曲目，或向 ABC 添加示例曲目与歌曲模板",
  				"Saves the current ABC text to a file": "将当前 ABC 文本保存到文件",
  				"Exports the selected tune as a MusicXML file using abc2xml": "使用 abc2xml 将所选曲目导出为 MusicXML 文件",
  				"Exports a PDF tunebook": "将曲目集导出为 PDF 曲集",
  				"Exports the tunebook as a website": "将曲目集导出为网站",
  				"Opens the ABC player with the currently selected tune.  Alt-click to play a random tune in the current ABC tunebook.  Press F4 to open the Player.": "在 ABC 播放器中打开当前所选曲目。按住 Alt 点击可随机播放当前 ABC 曲集中的曲目。按 F4 可打开播放器。",
  				"Opens the Tune Trainer with the currently selected tune.  Alt-click to train on a random tune in the current ABC tunebook.": "在曲目练习器中打开当前所选曲目。按住 Alt 点击可随机练习当前 ABC 曲集中的曲目。",
  				"When On, highlight notation by selecting the ABC text or highlight ABC text by clicking on the notation. Shift-click to temporarily hide incorrect-measure highlighting.": "启用后，选中 ABC 文本可突出显示对应五线谱，点击五线谱可选中对应 ABC 文本。按住 Shift 点击可暂时隐藏错误小节提示。",
  				"Brings up a menu with additional useful commands": "打开包含其他实用命令的菜单",
  				"Shows standard music notation": "显示标准五线谱",
  				"Shows note names tablature": "显示音名指法谱",
  				"Shows GDAE Mandolin tablature": "显示 GDAE 曼陀林指法谱",
  				"Shows GDAD Bouzouki tablature": "显示 GDAD 布祖基琴指法谱",
  				"Shows CGDAE 5-string Fiddle tablature": "显示 CGDAE 五弦小提琴指法谱",
  				"Shows standard EADGBE Guitar tablature": "显示标准 EADGBE 吉他指法谱",
  				"Shows DADGAD Guitar tablature": "显示 DADGAD 吉他指法谱",
  				"Shows Ukulele tablature (G string used for notes lower than C)": "显示尤克里里指法谱（低于 C 的音使用 G 弦）",
  				"Shows Tin Whistle (D) tablature": "显示 D 调锡哨笛指法谱",
  				"Transposes the selected tunes down one semitone.  Shift-click transposes down one full step.  Alt-click transposes down one octave.": "将所选曲目下移半音。按住 Shift 点击下移全音；按住 Alt 点击下移八度。",
  				"Transposes the selected tunes up one semitone.  Shift-click transposes up one full step.  Alt-click transposes up one octave.": "将所选曲目上移半音。按住 Shift 点击上移全音；按住 Alt 点击上移八度。",
  				"Saves a Snapshot of the contents of the ABC editor to browser storage.  Click for Snapshot #1, Shift-click for Snapshot #2, Alt-click for Snapshot #3, Shift-Alt-click for Snapshot #4.": "将 ABC 编辑器内容保存至浏览器存储。点击保存快照 1；按住 Shift、Alt 或 Shift+Alt 点击，分别保存快照 2、3、4。",
  				"Replaces the contents of the ABC editor with a Snapshot saved in browser storage.  Click for Snapshot #1, Shift-click for Snapshot #2, Alt-click for Snapshot #3, Shift-Alt-click for Snapshot #4.": "用浏览器存储中的快照替换 ABC 编辑器内容。点击恢复快照 1；按住 Shift、Alt 或 Shift+Alt 点击，分别恢复快照 2、3、4。",
  				"Shows the More ABC Tools dialog where you can hide or strip chords and other ABC annotations, inject instrument tablature, as well as perform other ABC operations": "打开“更多 ABC 工具”对话框，可隐藏或移除和弦及其他 ABC 标注、注入乐器指法谱，并执行其他 ABC 操作",
  				"Shows the Sharing dialog": "打开分享对话框",
  				"Clears all the ABC": "清空全部 ABC 乐谱",
  				"Shows the introduction dialog": "显示简介对话框",
  				"Explore the ABC Transcription Tools with 8 step-by-step guided tours.": "通过 8 个分步导览了解 ABC 乐谱工具。",
  				"Shows the latest update info dialog": "显示最新版本更新信息",
  				"For a better experience please zoom out the browser view:": "为获得更好的使用体验，请缩小浏览器视图：",
  				"Windows:": "Windows：",
  				"Mac:": "Mac：",
  				"(Hide Forever)": "（不再显示）",
  				"• Click": "• 点击",
  				"Welcome to the ABC Transcription Tools!": "欢迎使用 ABC 乐谱工具！",
  				"Click the": "点击",
  				"button for step-by-step walkthroughs of the most common ABC playback and tunebook creation workflows.": "按钮，查看 ABC 播放与曲集制作常用流程的分步导览。",
  				"Please check out the": "请参阅",
  				"for complete instructions and demo videos on how to use the tools.": "，其中包含完整使用说明和演示视频。",
  				"To begin, type or paste tunes in ABC format into the text area.": "首先，请在文本框中输入或粘贴 ABC 格式的曲谱。",
  				"Notation updates instantly as you make changes to the ABC.": "修改 ABC 乐谱时，五线谱会即时更新。",
  				"or": "或",
  				"to open or add ABC, MusicXML, BWW, or MIDI files from your system.": "可从本机打开或添加 ABC、MusicXML、BWW 或 MIDI 文件。",
  				"You may drag-and-drop ABC, MusicXML, BWW, or MIDI files onto the editor area to add them.": "也可以将 ABC、MusicXML、BWW 或 MIDI 文件拖放到编辑区来添加。",
  				"Once ABC has been entered and notation is displayed:": "输入 ABC 并显示五线谱后：",
  				"to play the current tune.": "可播放当前曲目。",
  				"to practice the current tune increasing tempos.": "可逐步提高速度练习当前曲目。",
  				"Zoom-Out": "缩小",
  				"arrows at the top-right to view the notation full screen.": "，即可全屏查看五线谱。",
  				"to save all the ABC to an ABC text file.": "可将全部 ABC 乐谱保存为文本文件。",
  				"to export your tunebook in PDF format.": "可将曲集导出为 PDF。",
  				"to export your tunebook as a website.": "可将曲集导出为网站。",
  				"ABC Syntax Highlighting is Enabled": "ABC 语法高亮已启用",
  				"Please try out the new ABC syntax highlighting features.": "欢迎体验新版 ABC 语法高亮功能。",
  				"If you decide you don't like it,": "如果您不希望使用此功能，",
  				"you can easily disable it from the Settings dialog.": "可在“设置”对话框中将其关闭。",
  				"What's New": "更新内容",
  				"Version 3355_101026_1000 released 10 October 2026": "版本 3355_101026_1000，发布于 2026 年 10 月 10 日",
  				"New Tools Added to": "新增工具：",
  				"Open ABC in External Tool": "在外部工具中打开 ABC",
  				"The": "该",
  				"ABC Recorder Fingering Player": "ABC 竖笛指法播放器",
  				"ABC Tremolo Harmonica Player": "ABC 颤音口琴播放器",
  				"tools have been added to the": "工具已添加至",
  				"dialog.": "对话框。",
  				"You can send either the current tune from the": "您可以将当前曲目从",
  				"or all tunes from the": "或将全部曲目从",
  				"dialog directly to the new tools.": "对话框直接发送到这些新工具。",
  				"Enhanced": "功能增强：",
  				"Note Names, Shape Notes & Solfège Injection": "音名、形状音符与视唱唱名注入",
  				"Note Names / Shape Notes / Solfège Injector": "音名 / 形状音符 / 视唱唱名注入工具",
  				"now supports placing text annotations": "现已支持放置文本标注",
  				"above or below the staff": "于谱表上方或下方",
  				", improved chord handling, and automatic replacement of previously injected tablature and shape-note annotations.": "，改进了和弦处理，并可自动替换先前注入的指法谱与形状音符标注。",
  				"Also includes corrected": "并修正了",
  				"Do-based and La-based minor Solfège": "首调 do 与 la 小调唱名法",
  				"About Highlighting": "关于乐谱联动",
  				"Since this is your first time using Highlighting, here is some important information:": "这是您首次使用乐谱联动，以下是重要说明：",
  				"When Highlighting is turned on:": "启用乐谱联动后：",
  				"Select ABC text to highlight the corresponding notes in red in the notation.": "选中 ABC 文本，可在五线谱中以红色突出显示对应音符。",
  				"Click any element in the notation to select the corresponding ABC text in the editor.": "点击五线谱中的任意元素，可在编辑器中选中对应的 ABC 文本。",
  				"Measures with too few or too many beats as determined by the meter are highlighted in yellow, including correctly constructed partial pickup measures and associated partial measure repeat endings.": "拍数与拍号不符的小节将以黄色突出显示；正确书写的弱起小节及相应的不完全小节反复结尾也会标出。",
  				"In the Quick Editor, Highlighting works one tune at a time. Click in the ABC for another tune to make it the current tune and redraw its notation with Highlighting.": "在快速编辑器中，乐谱联动一次仅作用于一首曲目。点击另一首曲目的 ABC，即可将其设为当前曲目并重新绘制联动五线谱。",
  				"Highlighting requires redrawing all tunes on each change to the ABC.": "每次修改 ABC 时，乐谱联动都需要重新绘制全部曲目。",
  				"This may be slow on large numbers of tunes.": "曲目数量较多时，重新绘制可能需要一些时间。",
  				"All pre-processing of the ABC at notation drawing time is turned off. Any hiding of Annotations/Text/Chords selected in the Advanced dialog as well as automatic injection of staff separation space will be disabled. Your settings will be restored when you turn highlighting off.": "启用联动时将关闭绘谱前的 ABC 预处理。高级设置中隐藏标注、文本或和弦的选项，以及自动插入谱表间距的功能也会暂停；关闭联动后将恢复原设置。",
  				"Some Tunes Were Not Tranposed": "部分曲目无法移调",
  				"Highlighting not possible with rendering disabled.": "渲染已关闭，无法启用乐谱联动。",
  				"Transpose not possible with rendering disabled.": "渲染已关闭，无法移调。",
  				"Transpose to Key Complete!": "移调至目标调完成！",
  				"Tunes sorted by Meter!": "已按拍号排序！",
  				"Tunes sorted by Key!": "已按调号排序！",
  				"Tunes sorted by Title!": "已按曲名排序！",
  				"Tunes sorted by Rhythm!": "已按节奏类型排序！",
  				"Tunes sorted by Composer!": "已按作曲者排序！",
  				"Tunes sorted by Notes!": "已按音符排序！",
  				"Sort by Title (T:)": "按曲名排序（T:）",
  				"Sort by Key (K:)": "按调号排序（K:）",
  				"Sort by Meter (M:)": "按拍号排序（M:）",
  				"Sort by Rhythm (R:)": "按节奏类型排序（R:）",
  				"Sort by Composer (C:)": "按作曲者排序（C:）",
  				"Sort by Notes (N:)": "按音符排序（N:）",
  				"Sort by Origin (O:)": "按来源排序（O:）",
  				"Sort by ID (X:)": "按编号排序（X:）",
  				"Renumber all X: Tags": "重新编号全部 X: 字段",
  				"Shuffle All Tunes": "随机排列全部曲目",
  				"Root key:": "主音：",
  				"Transpose all tunes": "移调全部曲目",
  				"Operation:": "操作：",
  				"PDF quality:": "PDF 质量：",
  				"Space between tunes (in 1/72\"):": "曲目间距（单位：1/72 英寸）：",
  				"Title Page title:": "标题页标题：",
  				"Title Page subtitle:": "标题页副标题：",
  				"Table of Contents title:": "目录标题：",
  				"Index title:": "索引标题：",
  				"Page Header:": "页眉：",
  				"Page Footer:": "页脚：",
  				"Playback links contain entire tunebook": "播放链接包含整本曲集",
  				"Soundfont for playback links:": "播放链接使用的 SoundFont：",
  				"Melody instrument for playback links:": "播放链接使用的旋律乐器：",
  				"Bass instrument for playback links:": "播放链接使用的低音乐器：",
  				"Chord instrument for playback links:": "播放链接使用的和弦乐器：",
  				"Playback speed (percentage, default is 100):": "播放速度（百分比，默认值为 100）：",
  				"Clicking \"Inject\" will inject the text into the header of your ABC tune(s).": "点击“注入”可将文本写入曲目的 ABC 文件头。",
  				"Header text to inject:": "要注入的文件头文本：",
  				"Enter header text to inject here": "在此输入要注入的文件头文本",
  				"Add ABC File Header Directives": "添加 ABC 文件头指令",
  				"Inject Custom Stringed Instrument Tab Annotation": "注入自定义弦乐器指法谱标注",
  				"This will inject an %abcjs_rendering_params annotation into the ABC tune(s) to generate custom stringed instrument tablature.": "此操作会向曲目的 ABC 中注入 %abcjs_rendering_params 标注，以生成自定义弦乐器指法谱。",
  				"Strings are numbered from low to high and use ABC pitch names.": "琴弦按音高从低到高编号，并使用 ABC 音名。",
  				"Each string must have a different pitch and be higher than the previous one.": "每根琴弦的音高必须互不相同，并且依次升高。",
  				"Click \"Inject\" to inject the checked fonts below from your Font Settings into the tunes.": "点击“注入”，即可将下方选中的字体设置写入曲目。",
  				"Spacing Injection Complete!": "谱表间距注入完成！",
  				"Instrument Injection Complete!": "乐器设置注入完成！",
  				"Grace Duration Injection Complete!": "装饰音时值注入完成！",
  				"Inject Reverb into the ABC": "将混响设置注入 ABC",
  				"Reload Tune with Changed Reverb Settings": "使用新的混响设置重新加载曲目",
  				"Reload Tune with Changed Instruments and Volumes": "使用新的乐器与音量设置重新加载曲目",
  				"Inject Instruments and Volumes into the ABC": "将乐器与音量设置注入 ABC",
  				"Are you sure you want to reset the MusicXML/MIDI Import Settings to their default values?": "确定要将 MusicXML / MIDI 导入设置恢复为默认值吗？",
  				"MusicXML/MIDI Import Settings": "MusicXML / MIDI 导入设置",
  				"Enable Metronome": "启用节拍器",
  				"Loading:": "正在加载：",
  				"Converting MIDI to ABC:": "正在将 MIDI 转换为 ABC：",
  				"Converting MusicXML to ABC:": "正在将 MusicXML 转换为 ABC：",
  				"User Guide": "使用指南",
  				"Search for Tunes": "搜索曲目",
  				"ABC Spec": "ABC 规范",
  				"MIDI": "MIDI",
  				"Tunebooks": "曲集",
  				"Credits": "致谢",
  				"Facebook": "Facebook",
  				"Forum": "论坛",
  				"Tip Jars": "赞助",
  				"No ABC file selected": "未选择 ABC 文件",
  				"Open": "打开",
  				"Add": "添加",
  				"Save": "保存",
  				"Export XML": "导出 MusicXML",
  				"Export PDF": "导出 PDF",
  				"Export Website": "导出网站",
  				"Play": "播放",
  				"Train": "练习",
  				"Highlighting": "乐谱联动",
  				"Notation": "五线谱",
  				"Names": "音名",
  				"Mandolin": "曼陀林",
  				"CGDAE": "CGDAE 五弦小提琴",
  				"GDAD": "GDAD 布祖基琴",
  				"Guitar": "吉他",
  				"DADGAD": "DADGAD 吉他",
  				"Uke": "尤克里里",
  				"Whistle": "D 调锡哨笛",
  				"Transpose Down": "向下移调",
  				"Transpose Up": "向上移调",
  				"Snapshot": "快照",
  				"Restore": "恢复",
  				"More Tools": "更多工具",
  				"Sharing": "分享",
  				"Clear": "清空",
  				"Show Introduction": "显示简介",
  				"✦ Guided Tours ✦": "✦ 功能导览 ✦",
  				"What's New": "更新内容",
  				"Cancel": "取消",
  				"OK": "确定",
  				"Ok": "确定",
  				"Yes": "是",
  				"No": "否",
  				"Close": "关闭",
  				"Done": "完成",
  				"Continue": "继续",
  				"Back": "返回",
  				"Next": "下一步",
  				"Previous": "上一步",
  				"Help": "帮助",
  				"Rendering ABC": "正在渲染 ABC 乐谱",
  				"Enter ABC or drag-and-drop ABC, MusicXML, BWW, or MIDI files here": "在此输入 ABC 乐谱，或将 ABC、MusicXML、BWW、MIDI 文件拖放到此处",
  				"Notation will appear here when you enter some ABC.": "输入 ABC 乐谱后，五线谱将显示在此处。",
  				"Click": "点击",
  				"to open ABC, MusicXML, BWW, or MIDI files.": "以打开 ABC、MusicXML、BWW 或 MIDI 文件。",
  				"to add ABC, MusicXML, BWW, MIDI files or a tune template.": "以添加 ABC、MusicXML、BWW、MIDI 文件或曲目模板。",
  				"Drag-and-drop": "拖放",
  				"on the editor area to add them.": "到编辑区即可添加。",
  				"Resize the ABC Editor": "调整 ABC 编辑器大小",
  				"by clicking and dragging its lower right corner.": "拖动右下角即可调整。",
  				"to find tunes by name.": "以按曲名查找曲目。",
  				"Export All Tunes": "导出全部曲目",
  				"Audio/MIDI": "音频 / MIDI",
  				"Image": "图像",
  				"ABC/MusicXML": "ABC / MusicXML",
  				"Titles": "曲名",
  				"Developer Tools": "开发者工具",
  				"Export all as MP3 Audio": "导出全部曲目为 MP3 音频",
  				"Export all as MIDI": "导出全部曲目为 MIDI",
  				"Export all as JPEG": "导出全部曲目为 JPEG",
  				"Export all as PNG": "导出全部曲目为 PNG",
  				"Export all as SVG": "导出全部曲目为 SVG",
  				"Export all Tunes as ABC": "逐首导出为 ABC",
  				"Export all Tunes as MusicXML": "逐首导出为 MusicXML",
  				"Export All Tune Titles": "导出全部曲名",
  				"Image width to export:": "导出图像宽度：",
  				"My Tools": "我的工具",
  				"ABC Features": "ABC 功能",
  				"Inject Tablature": "插入指法谱",
  				"Explorers": "探索工具",
  				"Other Tools": "其他工具",
  				"Strip Annotations": "移除装饰标记",
  				"Strip Text": "移除文本",
  				"Strip Chords": "移除和弦",
  				"Strip Injected Tab": "移除已插入的指法谱",
  				"Strip Ornaments": "移除装饰音",
  				"Inject Tune Title Numbers": "插入曲名编号",
  				"Inject PDF Section Header": "插入 PDF 分节标题",
  				"Inject Font Settings": "插入字体设置",
  				"Inject MIDI Programs and Volumes": "插入 MIDI 音色与音量",
  				"Inject Metronome": "插入节拍器",
  				"Inject Repeats + Intros": "插入反复段与前奏",
  				"Inject ABC Header Text": "插入 ABC 文件头文本",
  				"Inject Custom Stringed Instrument Tab": "插入自定义弦乐器指法谱",
  				"Comhaltas Transform": "Comhaltas 格式转换",
  				"Phrase Builder": "乐句构建器",
  				"Notes Incipits Builder": "曲首音型构建器",
  				"Add Tune Backup Chords": "为曲目添加伴奏和弦",
  				"Export Audio or Image": "导出音频或图像",
  				"Export Audio, Image, or PDF": "导出音频、图像或 PDF",
  				"Export All Tunes": "导出全部曲目",
  				"Inject Harmonica Tab": "插入口琴指法谱",
  				"Reformat Using MusicXML": "使用 MusicXML 重新排版",
  				"MusicXML/MIDI Import Settings": "MusicXML / MIDI 导入设置",
  				"Measures": "小节",
  				"Measure": "小节",
  				"Staff": "谱表",
  				"Staves": "谱表",
  				"Voice": "声部",
  				"Voices": "声部",
  				"Key": "调号",
  				"Key Signature": "调号",
  				"Time Signature": "拍号",
  				"Tempo": "速度",
  				"Pickup": "弱起",
  				"Chord": "和弦",
  				"Chords": "和弦",
  				"Lyrics": "歌词",
  				"Annotation": "标注",
  				"Annotations": "标注",
  				"Ornaments": "装饰音",
  				"Tablature": "指法谱",
  				"Transpose": "移调",
  				"Transposition": "移调",
  				"semitone": "半音",
  				"semitones": "半音",
  				"whole step": "全音",
  				"octave": "八度",
  				"Current tune": "当前曲目",
  				"All tunes": "全部曲目",
  				"Export": "导出",
  				"Import": "导入",
  				"Download": "下载",
  				"Upload": "上传",
  				"Filename": "文件名",
  				"Title": "曲名",
  				"Composer": "作曲者",
  				"Source": "来源",
  				"Settings": "设置",
  				"Options": "选项",
  				"Select": "选择",
  				"Select all": "全选",
  				"Search": "搜索",
  				"Filter": "筛选",
  				"Sort": "排序",
  				"Refresh": "刷新",
  				"Reset": "重置",
  				"Apply": "应用",
  				"Save Changes": "保存更改",
  				"Please select or enter an ABC tune before exporting MusicXML.": "请先选择或输入一首 ABC 曲目，再导出 MusicXML。",
  				"There was an issue converting the ABC to MusicXML.": "将 ABC 转换为 MusicXML 时发生错误。",
  				"Please select an ABC, MusicXML, or MIDI file": "请选择 ABC、MusicXML 或 MIDI 文件",
  				"Batch export is not supported on iOS or Android at this time.": "目前 iOS 和 Android 暂不支持批量导出。",
  				"Exporting MusicXML for tune": "正在导出 MusicXML，曲目序号",
  				"Exporting": "正在导出",
  				"Loading": "正在加载",
  				"Processing": "正在处理",
  				"Converting": "正在转换",
  				"Error": "错误",
  				"Warning": "警告",
  				"Success": "成功",
  				"Language": "语言",
  				"Interface language": "界面语言",
  				"English": "English",
  				"简体中文": "简体中文",
  				"Thank You!": "谢谢！",
  				"I hope my ABC Transcription Tools have been useful to you!": "希望 ABC 乐谱工具对您有所帮助！",
  				"If so, please consider dropping something in one of my": "如果觉得有帮助，欢迎通过以下方式赞助：",
  				"Virtual Tip Jars": "虚拟赞助入口",
  				"Cheers and thanks!": "谨致谢意！"
  			};
  			var textStates = new WeakMap();
  			var attributeStates = new WeakMap();
  			var currentLanguage = "en";
  			var translating = false;
  			var phraseKeys = Object.keys(translations).sort(function(a, b) {
  				return b.length - a.length;
  			});
  			var embeddedPhraseKeys = phraseKeys.filter(function(phrase) {
  				return /\s/.test(phrase);
  			});
  			var phrasePattern = new RegExp(embeddedPhraseKeys.map(function(phrase) {
  				return phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  			}).join("|"), "g");
  
  			function translateText(text) {
  				text = text.replace(/[\u00a0\u202f]/g, " ");
  				var leadingWhitespace = (text.match(/^\s*/) || [""])[0];
  				var trailingWhitespace = (text.match(/\s*$/) || [""])[0];
  				var trimmedText = text.trim();
  				if (translations[trimmedText]) {
  					return leadingWhitespace + translations[trimmedText] + trailingWhitespace;
  				}
  				return text.replace(phrasePattern, function(phrase) {
  					return translations[phrase] || phrase;
  				});
  			}
  
  			function isExcluded(node) {
  				var element = node.nodeType === 1 ? node : node.parentElement;
  				if (!element) return true;
  				var excludedElements = node.nodeType === 3
  					? "script,style,textarea,code,pre,svg,[contenteditable='true'],#abc,#notation-holder,#offscreenrender,#qrcode,[data-no-translate]"
  					: "script,style,code,pre,svg,[contenteditable='true'],#notation-holder,#offscreenrender,#qrcode,[data-no-translate]";
  				return !!element.closest(excludedElements);
  			}
  
  			function updateText(node) {
  				if (isExcluded(node)) return;
  				var state = textStates.get(node);
  				var current = node.nodeValue;
  				var original = state && current === state.rendered ? state.original : current;
  				var rendered = currentLanguage === "zh-CN" ? translateText(original) : original;
  				textStates.set(node, { original: original, rendered: rendered });
  				if (current !== rendered) node.nodeValue = rendered;
  			}
  
  			function updateAttribute(element, name) {
  				if (isExcluded(element)) return;
  				var attributes = attributeStates.get(element);
  				if (!attributes) {
  					attributes = {};
  					attributeStates.set(element, attributes);
  				}
  				var state = attributes[name];
  				var current = name === "value" && /^(INPUT|BUTTON)$/.test(element.tagName)
  					? element.value
  					: element.getAttribute(name);
  				if (current === null) return;
  				var original = state && current === state.rendered ? state.original : current;
  				var rendered = currentLanguage === "zh-CN" ? translateText(original) : original;
  				attributes[name] = { original: original, rendered: rendered };
  				if (current !== rendered) {
  					if (name === "value" && /^(INPUT|BUTTON)$/.test(element.tagName)) {
  						element.value = rendered;
  					} else {
  						element.setAttribute(name, rendered);
  					}
  				}
  			}
  
  			function translateTree(root) {
  				if (!root || isExcluded(root)) return;
  				var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  				var textNodes = [];
  				while (walker.nextNode()) textNodes.push(walker.currentNode);
  				textNodes.forEach(updateText);
  
  				var elements = [];
  				if (root.nodeType === 1) elements.push(root);
  				if (root.querySelectorAll) elements = elements.concat(Array.prototype.slice.call(root.querySelectorAll("*")));
  				elements.forEach(function(element) {
  					["title", "placeholder", "aria-label", "value"].forEach(function(name) {
  						updateAttribute(element, name);
  					});
  				});
  			}
  
  			window.SetInterfaceLanguage = function(language) {
  				currentLanguage = language === "zh-CN" ? "zh-CN" : "en";
  				var selector = document.getElementById("ui-language");
  				if (selector) selector.value = currentLanguage;
  				document.documentElement.lang = currentLanguage;
  				try {
  					localStorage.setItem("abctools-interface-language", currentLanguage);
  				} catch (error) {
  					console.warn("Unable to save interface language preference.", error);
  				}
  				translating = true;
  				var intro = document.getElementById("notation-placeholder-text");
  				var desktop = document.getElementById("desktop_use_message");
  				var searchHint = document.getElementById("notation-placeholder-text-2");
  				if (intro) {
  					intro.innerHTML = currentLanguage === "zh-CN"
  						? "<strong>输入 ABC 乐谱后，五线谱将在此处显示。</strong><br><br><br>点击 <strong>打开</strong> 可导入 ABC、MusicXML、BWW 或 MIDI 文件。<br><br>点击 <strong>添加</strong> 可导入文件或添加曲目模板。"
  						: "<strong>Notation will appear here when you enter some ABC.</strong><br><br><br>Click <strong>Open</strong> to open ABC, MusicXML, BWW, or MIDI files.<br><br>Click <strong>Add</strong> to add ABC, MusicXML, BWW, MIDI files or a tune template.";
  				}
  				if (desktop) {
  					desktop.innerHTML = currentLanguage === "zh-CN"
  						? "<strong>拖放</strong> ABC、MusicXML、BWW 或 MIDI 文件到编辑区即可添加。<br><br><br><strong>调整 ABC 编辑器大小</strong>：拖动编辑器右下角。"
  						: "<strong>Drag-and-drop</strong> ABC, MusicXML, BWW, or MIDI files on the editor area to add them.<br><br><br><strong>Resize the ABC Editor</strong> by clicking and dragging its lower right corner.";
  				}
  				if (searchHint) {
  					searchHint.innerHTML = currentLanguage === "zh-CN"
  						? "点击 <strong>搜索曲目</strong>，按曲名查找曲目。"
  						: "Click <strong>Search for Tunes</strong> to find tunes by name.";
  				}
  				translateTree(document.body);
  				translating = false;
  			};
  
  			var savedLanguage = "en";
  			try {
  				savedLanguage = localStorage.getItem("abctools-interface-language") || "en";
  			} catch (error) {
  				console.warn("Unable to read interface language preference.", error);
  			}
  			var observer = new MutationObserver(function(records) {
  				if (translating || currentLanguage !== "zh-CN") return;
  				translating = true;
  				records.forEach(function(record) {
  					if (record.type === "characterData") {
  						updateText(record.target);
  					} else if (record.type === "attributes") {
  						updateAttribute(record.target, record.attributeName);
  					} else {
  						record.addedNodes.forEach(function(node) {
  							if (node.nodeType === 1 || node.nodeType === 3) translateTree(node);
  						});
  					}
  				});
  				translating = false;
  			});
  			observer.observe(document.body, {
  				subtree: true,
  				childList: true,
  				characterData: true,
  				attributes: true,
  				attributeFilter: ["title", "placeholder", "aria-label", "value"]
  			});
  			window.SetInterfaceLanguage(savedLanguage);
  			window.setInterval(function() {
  				if (currentLanguage !== "zh-CN") return;
  				document.querySelectorAll("input[type=button],input[type=submit],button").forEach(function(element) {
  					updateAttribute(element, "value");
  				});
  			}, 500);
  		})();

  window.addEventListener("load", function() {
    var languageSelector = document.getElementById("ui-language");
    if (languageSelector) window.SetInterfaceLanguage(languageSelector.value);
  });
})();
