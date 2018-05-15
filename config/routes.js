/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
     * etc. depending on your default view engine) your home page.              *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/


    '/': {
        view: 'auth/login'
    },
//    'GET /:slug': 'SongsController.listSongWeb',

    /**
     * AdminController
     */
    'GET /admin/home': 'AdminController.index',
    'GET /admin/event/team/:id': 'AdminController.team',

    /**
     * AuthController
     */
    'GET /auth/login': {view: 'auth/login'},
    'GET /auth/register': {view: 'auth/register'}, // đăng ký xong comment lại
    'POST /auth/login': 'AuthController.login',

    /**
     * UsersController
     */
    'POST /login': 'UsersController.login',
    'POST /loginOther': 'UsersController.loginOther',
    'POST /fcm': 'UsersController.fcm',
    'POST /checkLogin': 'UsersController.checkLogin',
    'POST /register': 'UsersController.register',
    'POST /editUser': 'UsersController.editUser',
    'POST /searchAllUser': 'UsersController.searchAllUser',
    'POST /userDetail': 'UsersController.userDetail',
    'POST /listFriend': 'UsersController.listFriend',
    'POST /pendingFriend': 'UsersController.pendingFriend',
    'POST /listInvi': 'UsersController.listInvi',
    'POST /addPlaylist': 'UsersController.addPlaylist',
    'POST /listPlaylist': 'UsersController.listPlaylist',
    'POST /addHistory': 'UsersController.addHistory',
    'POST /listHistory': 'UsersController.listHistory',
    'POST /listNameCategory': 'UsersController.listNameCategory',
    'POST /editNameCategory': 'UsersController.editNameCategory',
    'POST /deleteHistory': 'UsersController.deleteHistory',
    'POST /deleteSongPlaylist': 'UsersController.deleteSongPlaylist',
    'POST /request': 'UsersController.request',
    'POST /listMyScore': 'UsersController.listMyScore',
    'POST /profile': 'UsersController.profile',
    'POST /myTopScore': 'UsersController.myTopScore',
    'POST /listPush': 'UsersController.listPush',
    'POST /checkPush': 'UsersController.checkPush',
    /**
     * SongsController
     */
    'GET /add_song': 'SongsController.add_song',
    'POST /uploadSong': 'SongsController.uploadSong',
    'POST /listSongUser': 'SongsController.listSongUser',
    'POST /listRankScoreOfMonth': 'SongsController.listRankScoreOfMonth',
    'POST /listRankScoreOfWeek': 'SongsController.listRankScoreOfWeek',
    'POST /listRankScoreOfYear': 'SongsController.listRankScoreOfYear',
    'POST /songDetail': 'SongsController.songDetail',
    'POST /searchSongAll': 'SongsController.searchSongAll',
    'POST /uploadRecording': 'SongsController.uploadRecording',
    'POST /listSongRanking': 'SongsController.listSongRanking',
    'POST /declineDuetInvi': 'SongsController.declineDuetInvi',
    'POST /scoring': 'SongsController.scoring',
    'POST /cancelUpload': 'SongsController.cancelUpload',

    /**
     * RelationshipsController
     */
    'POST /addFriend': 'RelationshipsController.addFriend',
    'POST /acceptFriend': 'RelationshipsController.acceptFriend',
    'POST /declineFriend': 'RelationshipsController.declineFriend',
    'POST /deleteFriend': 'RelationshipsController.deleteFriend',

    /**
     * ContactsController
     */
    'POST /contact': 'ContactsController.contact',

    /**
     * ChallengesController
     */
    'POST /addChallenge': 'ChallengesController.addChallenge',
    'POST /listChallenge': 'ChallengesController.listChallenge',
    'POST /acceptChallenge': 'ChallengesController.acceptChallenge',
    'POST /detailChallenge': 'ChallengesController.detailChallenge',
    'POST /declineChallenge': 'ChallengesController.declineChallenge',

    /***************************************************************************
     *                                                                          *
     * Custom routes here...                                                    *
     *                                                                          *
     * If a request to a URL doesn't match any of the custom routes above, it   *
     * is matched against Sails route blueprints. See `config/blueprints.js`    *
     * for configuration options and examples.                                  *
     *                                                                          *
     ***************************************************************************/

};
