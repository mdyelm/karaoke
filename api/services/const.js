var moment = require('moment-timezone');

// message error
exports.loginUserPass = "ユーザー名またはパスワードは正しくありません。";
exports.apiServer = "サーバーは誤りがあります。";
exports.uuidOrToken = "UUID は存在しないかtoken_loginは誤りがあります。";
exports.uploadImg = "アップロードする写真は4 MB以下で、フォーマットはJPG、PNG、GIFのいずれかを使用してください。";
exports.uploadMidi = "midiファイルは4MB以下です。";
exports.uploadIconSong = "iconファイルは4MB以下です。";
exports.uploadimgCtSong = "img_ctファイルは4MB　以下です。";
exports.uploadSong = "songファイルは50MB以下です。";
exports.uploadSongFull = "song_fullファイルは50MB以下です。";
exports.loginFacebookId = "facebook_idはもう存在しました。";
exports.loginGoogleId = "google_idはもう存在しました。";
exports.loginYahooId = "yahoo_idはもう存在しました。";
exports.notBlank = "入力して下さい。";
exports.wrongUploadSong = "アップロード順番は正しくないです。";
exports.uploadSongEr = "曲アップロードは誤りがあります。";
exports.songNotExist = "曲は存在しません。";
exports.userNotExist = "ユーザーは存在しません。";
exports.uploadRecorde = "録音のアップロードは誤りがあります。";
exports.declineFriend = "友達を断るのは失敗しました。";
exports.deleteHistoryEr = "レコード歴史は存在しません。";
exports.deleteSongPlaylistEr = "曲は存在しません。";
exports.deleteChallengeEr = "バトルのレコードは存在しません。";
exports.deleteDuetInvi = "デュエットのレコードは存在しません。";
exports.errHash = "ハッシュは存在しません。";
exports.errPathRc = "ディレクトリは正しくありません。";
//    /**
//     * Admin
//     * city
//     */
exports.city = [
    {value: '', name: '選択してください'},
    {value: '北海道', name: '北海道'},
    {value: '東北', name: '東北'},
    {value: '関東', name: '関東'},
    {value: '中部', name: '中部'},
    {value: '近畿', name: '近畿'},
    {value: '中国', name: '中国'},
    {value: '四国', name: '四国'},
    {value: '九州', name: '九州'},
    {value: '沖縄', name: '沖縄'}
];
