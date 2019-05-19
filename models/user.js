var mongodb = require('./db');

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
    this.role = user.role;
    this.tname = user.tname;
    this.phone = user.phone;
    this.address = user.address;
    this.salary = user.salary;
    this.adopt = user.adopt;
    this.text = user.text;
    this.picture = user.picture;
};

module.exports = User;


//存储用户信息
User.prototype.save = function(callback) {
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth()+1),
        day : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
    }
    //要存入数据库的用户文档
    var user = {
        time: time,
        name: this.name,
        password: this.password,
        email: this.email,
        role: this.role,
        tname: this.tname,
        phone: this.phone,
        address: this.address,
        salary: this.salary,
        adopt: this.adopt,
        text: this.text,
        picture: this.picture
    };

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
        return callback(err);//错误，返回 err 信息
        }

    //读取 users 集合
    db.collection('users', function (err, collection) {
        if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
        }
    
    //将用户数据插入 users 集合
        collection.insert(user, {safe: true}, function (err, user) {
            mongodb.close();//关闭数据库
            callback(null, user[0]);//成功！err 为 null，并返回存储后的文档
            });
        });
    });
};

//读取用户信息
User.get = function(name, callback) {
//打开数据库
    mongodb.open(function (err, db) {
    if (err) {
        return callback(err);//错误，返回 err 信息
    }
    //读取 users 集合
    db.collection('users', function (err, collection) {
    if (err) {
        mongodb.close();//关闭数据库
        return callback(err);//错误，返回 err 信息
        }
    //查找用户名（name键）值为 name 一个文档
    collection.findOne({
        name: name
    }, function(err, user){
        mongodb.close();//关闭数据库
        if (user) {
            return callback(null, user);//成功！返回查询的用户信息
        }
            callback(err);//失败！返回 err 信息
            });
        });
    });
}

User.getTen = function(name, page, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 users 集合
    db.collection('users', function(err, collection) {
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
		//根据 query 对象查询，并跳过前 (page-1)*6个结果，返回之后的 6 个结果
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

//更新用户信息
User.update = function(name, obj, callback) {
//打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
        if (err) {
            mongodb.close();//关闭数据库
            return callback(err);//错误，返回 err 信息
        }
        //查找用户名（name键）值为 name 一个文档
        collection.update({name:name},{$set:obj}, function(err){
            mongodb.close();//关闭数据库
            if (err) {
                return callback(err);
            }
            callback(null);
            });
        });
    });
};

//删除一条数据
User.removeOne = function(_id, callback) { 
//打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
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
