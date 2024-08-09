const {
    CommentHub,
    NicoNicoCommentPublisher,
    TwitchCommentPublisher,
    CLICommentSubscriber,
    OBSOverlayCommentSubscriber,
} = require('./packages/simple-comment-viewer/build/simple-comment-viewer');

new CommentHub()
    .addPublisher(
        new NicoNicoCommentPublisher({
            liveId: process.env.NICO_LIVE_ID,
        })
    )
    // .addPublisher(
    //     new TwitchCommentPublisher({
    //         channelId: 'kiikuragee',
    //     })
    // )
    .addSubscriber(new CLICommentSubscriber())
    .addSubscriber(
        new OBSOverlayCommentSubscriber({
            port: 51984,
        })
    );
