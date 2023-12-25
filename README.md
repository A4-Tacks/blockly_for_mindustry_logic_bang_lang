本项目基于对 [custom-generator-codelab] 的修改, 采用GPLv3许可证发布

其目的是为了使用图形编辑器生成 [MindustryLogicBangLang] 的代码,
因为直接编写bang语言很多时候需要打开逻辑语言的编辑器查看参数, 会很不方便

[custom-generator-codelab]: https://github.com/google/blockly-samples/tree/a662278cb9c511e001ee3cd2977a891976ea06a9/examples/custom-generator-codelab
[MindustryLogicBangLang]: https://github.com/A4-Tacks/mindustry_logic_bang_lang

项目的构建可以使用`yarn build`, 这会调用依赖中的webpack进行构建,
并生成一个`dist`目录, 直接访问该目录中的`index.html`即可

本项目具有中文补丁, 请查看 [chinese-patch] 分支

[chinese-patch]: https://github.com/A4-Tacks/blockly_for_mindustry_logic_bang_lang/tree/chinese-patch
