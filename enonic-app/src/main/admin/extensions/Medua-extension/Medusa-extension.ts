const adminLib = require('/lib/xp/admin');

const url = adminLib.extensionUrl({
    application: 'com.example.app',
    extension: 'Medusa-extension',
    params: { contentId: '123' }
});

exports.GET = (req) => {
    const contentId = req.params.contentId;
    return {
        body: `<div>Inspecting content ${contentId}</div>`,
        contentType: 'text/html'
    };
};