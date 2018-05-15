
module.exports = {

    // sai tài khoản mật khẩu đăng nhập
    loginUserPass: function () {
        return "ユーザー名またはパスワードは正しくありません。";
    },
    // lỗi api của server
    apiServer: function () {
        return "サーバーは誤りがあります。";
    },
    // lỗi uuid không tồn tại hoặc sai token_login
    uuidOrToken: function () {
        return "UUID は存在しないかtoken_loginは誤りがあります。";
    },
    // upload ảnh jpg png gif max file 4Mb
    uploadImg: function () {
        return "アップロードする写真は4 MB以下で、フォーマットはJPG、PNG、GIFのいずれかを使用してください。";
    },
    // midi 
    uploadMidi: function () {
        return "midiファイルは4MB以下です。";
    },
//    upload icon
    uploadIconSong: function () {
        return "iconファイルは4MB以下です。";
    },
//    upload img_ct
    uploadimgCtSong: function () {
        return "img_ctファイルは4MB　以下です。";
    },
    //upload song
    uploadSong: function () {
        return "songファイルは50MB以下です。";
    },
    uploadSongFull: function () {
        return "song_fullファイルは50MB以下です。";
    },
    // đăng nhập thông báo sai gg fb yh id
    loginFacebookId: function () {
        return "facebook_idはもう存在しました。";
    },
    loginGoogleId: function () {
        return "google_idはもう存在しました。";
    },
    loginYahooId: function () {
        return "yahoo_id  はもう存在しました。";
    },
    // không được để trống
    notBlank: function () {
        return "入力して下さい。";
    },
    // up sai thứ tự upload 
    wrongUploadSong: function () {
        return "アップロード順番は正しくないです。";
    },
    // upload bị lỗi
    uploadSongEr: function () {
        return "曲アップロードは誤りがあります。";
    },
    // bài hát không tồn tại
    songNotExist: function () {
        return "曲は存在しません。";
    },
    // người dùng không tồn tại
    userNotExist: function () {
        return "ユーザーは存在しません。";
    },
    //  upload file ghi âm 
    uploadRecorde: function () {
        return "録音のアップロードは誤りがあります。";
    },
    // từ chối bạn thất bại
    declineFriend: function () {
        return "友達を断るのは失敗しました。";
    },
    //lịch sử bản ghi không tồn tại
    deleteHistoryEr: function () {
        return "レコード歴史は存在しません。";
    },
    //bài hát không tồn tại
    deleteSongPlaylistEr: function () {
        return "曲は存在しません。";
    },
//    bản ghi thách đấu không tồn tại
    deleteChallengeEr: function () {
        return "バトルのレコードは存在しません。";
    },
//    bản ghi song ca không tồn tại
    deleteDuetInvi: function () {
        return "デュエットのレコードは存在しません。";
    },
//    hash không tồn tại
    errHash: function () {
        return "ハッシュは存在しません。";
    },
    // đường dẫ sai 
    errPathRc: function () {
        return "ディレクトリは正しくありません。";
    }
};