var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Post(title, losttime, phone, post, picture) {
    this.title = title;
    this.losttime = losttime;
    this.phone = phone;
    this.post = post;
    this.picture = picture;
}
module.exports = Post;
//存储一篇文章及其相关信息


Post.prototype.save = function(callback) {
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth()+1),
        day : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
    }
    //要存入数据库的文档
    var post = {
        time: time,
        title: this.title,
        losttime: this.losttime,
        phone: this.phone,
        post: this.post,
        picture: this.picture
    };
    //打开数据库
    mongodb.open(function (err, db) {
    if (err) {
        return callback(err);
    }
    //读取 posts 集合
    db.collection('posts', function (err, collection) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        //将文档插入 posts 集合
        collection.insert(post, {
            safe: true
        }, function (err, post) {
            mongodb.close();
            callback(null);
            });
        });
    });
};


//读取文章及其相关信息
Post.get = function(name, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
    if (err) {
        return callback(err);
    }
    //读取 posts 集合
    db.collection('posts', function(err, collection) {
    if (err) {
        mongodb.close();
        return callback(err);
    }
    var query = {};
    if (name) {
        query.name = name;
    }
    //根据 query 对象查询文章
    collection.find(query).sort({
        time: -1
    }).toArray(function (err, docs) {
        mongodb.close();
            if (err) {
        return callback(err);//失败！返回 err
        }
    callback(null, docs);//成功！以数组形式返回查询的结果
            });
        });
    });
};


//读取文章及其相关信息
Post.getTen = function(name, page, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = {};
      if (name) {
        query.name = name;
      }
	  //使用count返回特定查询的文档数
      collection.count(query,function(err,total){
		//根据 query 对象查询，并跳过前 (page-1)*6 个结果，返回之后的 6 个结果
		collection.find(query,{
			skip:(page-1)*8,
			limit:8
		}).sort({
				time: -1
			}).toArray(function (err, docs) {
				mongodb.close();
				if (err) {
					return callback(err);//失败！返回 err
				}
				callback(null, docs, total);//成功！以数组形式返回查询的结果
			});
		});
	});
});
};


//删除一条数据
Post.removeOne = function(_id, callback) { 
//打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            //删除信息
            collection.remove({_id: new ObjectID(_id)}, function (err, collection) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

//读取相关信息(根据id精确获取一个宠物信息)
Post.getOne = function(_id, callback) {

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "_id": new ObjectID(_id)
            }, function (err, post) {
                mongodb.close();
                if (post) {
                        return callback(null, post);//成功！返回查询的宠物信息
                }
                callback(err);//失败！返回 err 信息
            });
        });
    });
};
