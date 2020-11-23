import * as vscode from 'vscode';
import * as _ from 'lodash';

export class Contributors {
    public static readonly apiMap = new Map<string, any>();

    public static async getSnippet(uiOptions: any) {
        const contributorId = _.get(uiOptions, "contributorId");
        const snippetName = _.get(uiOptions, "snippetName");
        if (contributorId && snippetName) {
            const api = await Contributors.apiMap.get(contributorId);
            const snippetContext = _.get(uiOptions, "context");
            const snippets = api.getCodeSnippets(snippetContext);
            return snippets.get(snippetName);
        }
    }

    public static add(extension: vscode.Extension<any>) {
        const extensionName: string = _.get(extension, "packageJSON.name");
        const extensionPublisher: string = _.get(extension, "packageJSON.publisher");
        const extensionId: string = `${extensionPublisher}.${extensionName}`;
        try {
            const apiPromise = (extension.isActive ? extension.exports : extension.activate());
            Contributors.apiMap.set(extensionId, apiPromise);
        } catch (error) {
            const errorMessage = _.get(error, "stack", _.get(error, "message", error));
            console.error(errorMessage);
            // TODO: Add Logger.error
        }
    }

    public static init() {
        _.forEach(vscode.extensions.all, (extension: vscode.Extension<any>) => {
            const extensionDependencies: string[] = _.get(extension, "packageJSON.extensionDependencies");
            if (_.includes(extensionDependencies, "saposs.code-snippet")) {
                Contributors.add(extension);
            }
        });
    }
}
