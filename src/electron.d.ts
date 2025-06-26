/*
    TypeScript declarations for the custom electron API exposed via preload.js
    This fixes linting errors for window.electron usage in renderer.js

    Not having this can result in the vscode linter going spastic about electron
    not being defined.
*/

declare global
{
    interface Window
    {
        electron:
        {
            /**
                Send message to main process

                @param channel      The channel name ('toMain' or 'button-clicked')
                @param data         The data to send
            */

            sendToMain: (channel: string, data: any) => void;

            /**
                Receive message from main process

                @param channel      The channel name ('fromMain')
                @param callback     Function to handle received data
            */

            receiveFromMain: (channel: string, callback: ( ...args: any[] ) => void) => void;

            /**
                Ping test for IPC communication

                @returns            Promise that resolves with 'pong'
            */

            ping: () => Promise<string>;
        };
    }
}

/*
    export as module
*/

export {};
