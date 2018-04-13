const QB = require('./src/qbMain.js');

QB.init(36125, 'gOGVNO4L9cBwkPE', 'JdqsMHCjHVYkVxV', { debug: { mode: 1 } });
QB.createSession({login: 'www@www.www', password: '123123123'}, (err, session) => {
    QB.chat.connect({userId: session.user_id, password: session.token}, (e,r) => console.dir(r.items));
});
