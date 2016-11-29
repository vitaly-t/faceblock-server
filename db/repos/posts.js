'use strict';

let squel = require("squel");
let sql = require('../sql').posts;
let Constants = require('../../Constants');

module.exports = (rep, pgp) => {
    let defaultParams = {
      userIds: [],
      orderBy: Constants.ORDERBY.recent,
      count: Constants.COUNT
    };
    return {
        defaultParams,
        create: () =>
            rep.none(sql.create),
        add: post => {
          let sqlString = squel.insert().into('Posts').setFieldsRows([post]).toString() + ' RETURNING *';
          return rep.one(sqlString, post => post);
        },
        drop: () =>
            rep.none('DROP TABLE Posts'),
        empty: () =>
            rep.none('TRUNCATE TABLE Posts'),
        remove: id =>
            rep.result('DELETE FROM Posts WHERE id = $1', id, r => r.rowCount),
        find: id =>
            rep.oneOrNone('SELECT * FROM Posts WHERE id = $1', id),
        customFind: where =>
            rep.any('SELECT * FROM Posts ' + where),
        findByParams: (params = defaultParams) => {
            let sqlString = '';
            if(params.userIds.length > 0)
              sqlString = squel.select().from('posts').where('userid IN ?', params.userIds).order(params.orderBy, false).order('id').toString();
            else
              sqlString = squel.select().from('posts').order(params.orderBy, false).order('id').toString();
            return rep.any(sqlString);
        },
        all: () =>
            rep.any('SELECT * FROM Posts'),
        total: () =>
            rep.one('SELECT count(*) FROM Posts', [], a => +a.count)
    };
};
