const vscode = require('vscode');
const Uri = vscode.Uri;
const path = require('path');
const fs = require('fs');
const util = require('./utils');

/**
 * 查找文件定义的provider，匹配到了就return一个location，否则不做处理
 * 最终效果是，当按住Ctrl键时，如果return了一个location，字符串就会变成一个可以点击的链接，否则无任何效果
 * @param {*} document 
 * @param {*} position 
 * @param {*} token 
 */
function provideDefinition(document, position, token) {
	const fileName = document.fileName;
	const workDir = path.dirname(fileName);
	const word = document.getText(document.getWordRangeAtPosition(position));
	const line = document.lineAt(position);
	const projectPath = util.getProjectPath(document);

	console.log('====== 进入 provideDefinition 方法 ======');
	console.log('fileName: ' + fileName); // 当前文件完整路径
	console.log('workDir: ' + workDir); // 当前文件所在目录
	console.log('word: ' + word); // 当前光标所在单词
	console.log('line: ' + line.text); // 当前光标所在行
	console.log('projectPath: ' + projectPath); // 当前工程目录
	// 只处理package.json文件
	if (/\/package\.json$/.test(fileName)) {
		console.log(word, line.text);
		const json = document.getText();
		if (new RegExp(`"(dependencies|devDependencies)":\\s*?\\{[\\s\\S]*?${word.replace(/\//g, '\\/')}[\\s\\S]*?\\}`, 'gm').test(json)) {
			let destPath = `${workDir}/node_modules/${word.replace(/"/g, '')}/package.json`;
			if (fs.existsSync(destPath)) {
				// new vscode.Position(0, 0) 表示跳转到某个文件的第一行第一列
				return new vscode.Location(vscode.Uri.file(destPath), new vscode.Position(0, 0));
			}
		}
	}
}


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('>>> 插件激活');
	// ----------------------registerCommand start---------------------------------------
	// 指令事件注册
	let helloMe = vscode.commands.registerCommand('vscode-javascript-demo.helloMe', function () {
		vscode.window.showInformationMessage('helloMe!');
	});
	context.subscriptions.push(helloMe); // 所有注册类的API执行后都需要将返回结果放到context.subscriptions中去
	//  回调函数参数
	// 	当从资源管理器中右键执行命令时会把当前选中资源路径uri作为参数传过；
	//  当从编辑器中右键菜单执行时则会将当前打开文件路径URI传过去；
	//  当直接按Ctrl+Shift+P执行命令时，这个参数为空；
	let getCurrentFilePath = vscode.commands.registerCommand('vscode-javascript-demo.getCurrentFilePath', (uri) => {
		vscode.window.showInformationMessage(`当前文件(夹)路径是：${uri ? uri.path : '空'}`);
	})
	context.subscriptions.push(getCurrentFilePath);
	// ----------------------registerCommand end---------------------------------------


	// ----------------------registerTextEditorCommand start---------------------------------------
	// 仅在有被编辑器被激活时调用才生效; 这个命令可以访问到当前活动编辑器textEditor
	let testEditorCommand = vscode.commands.registerTextEditorCommand('vscode-javascript-demo.testEditorCommand', (textEditor, edit) => {
		console.log('您正在执行编辑器命令！');
		// console.log("textEditor:", textEditor);
		// console.log("edit:", edit);
	})
	context.subscriptions.push(testEditorCommand);
	// ----------------------registerTextEditorCommand end---------------------------------------

	// 自定义右键菜单点击后的执行
	let testMenuShow = vscode.commands.registerCommand('vscode-javascript-demo.testMenuShow', function () {
		vscode.window.showInformationMessage('自定义右键菜单点击后的执行!');
	});
	context.subscriptions.push(testMenuShow);



	// 获取所有命令
	vscode.commands.getCommands().then(allCommands => {
		console.log('所有命令：', allCommands);
	});

	context.subscriptions.push(vscode.languages.registerDefinitionProvider(['json'], {
		provideDefinition
	}));

	// // 复杂命令
	// let uri = Uri.file('/src');
	// commands.executeCommand('vscode-javascript-demo.openFolder', uri).then(sucess => {
	// 	console.log(success);
	// });
}


exports.activate = activate;

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
