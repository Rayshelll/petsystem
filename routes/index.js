
/*
 * GET home page.
 */
var crypto = require('crypto'),//crypto 是 Node.js 的一个核心模块，我们后面用它生成散列值来加密密码
    User = require('../models/user.js');
    Pet = require('../models/pet.js');
    Post = require('../models/post.js');
    Apply = require('../models/apply.js');
    Newpost = require('../models/newpost.js');

    var express = require('express');
    var mutipart= require('connect-multiparty');
    var mutipartMiddeware = mutipart();
    var fs = require('fs');
    var formidable = require('formidable');

//路由规划
module.exports = function(app){
  app.get('/index', function (req, res) {
    res.render('index', {
      title:'',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
  });
  });
  app.post('/index', function(req, res){
  });

  app.get('/', function (req, res) {
    Post.get(null, function (err, posts) {
      if (err) {
        posts = [];
      }
    Pet.get(null, function (err, pets){
        if (err) {
          pets = [];
        }
    Newpost.get(null, function (err, newposts){
        if (err) {
          newposts = [];
        }
      
        res.render('home', {
          title:'主页',
          user: req.session.user,
          posts: posts,
          pets: pets,
          newposts: newposts,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
  });
  

  app.post('/', function(req, res){
  });
  
  app.get('/regist', checkNotLogin);
  app.get('/regist', function (req, res) {
    res.render('regist', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()  
    });
  });

  app.post('/regist', checkNotLogin);
  app.post('/regist', function(req, res){
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body['repassword'];
    //检验用户两次输入的密码是否一致
    if (password_re != password) {
    req.flash('error', '两次输入的密码不一致!');
    return res.redirect('/regist');
    }
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
        name: req.body.name,
        password: password,
        role: '0'
    });
    //检查用户名是否已经存在
    User.get(newUser.name, function (err, user) {
    if (user) {
      req.flash('error', '用户已存在!');
      return res.redirect('/regist');//用户名存在则返回注册页
    }
    //如果不存在则新增用户
    newUser.save(function (err, user) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/regist');
    }
    req.session.user = user;//用户信息存入 session
    req.flash('success', '注册成功!请登录');
    res.redirect('/login');//注册成功后返回登录
    });
  });
});


  app.get('/login', checkNotLogin);
  app.get('/login', function (req, res) {
    res.render('login', {
      title:'登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
    password = md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    User.get(req.body.name, function (err, user) {
    if (!user) {
      req.flash('error', '用户不存在!');
      return res.redirect('/login');//用户不存在则跳转到登录页
    }
    //检查密码是否一致
    if (user.password != password) {
      req.flash('error', '密码错误!');
      return res.redirect('/login');//密码错误则跳转到登录页
    }
     //判断是否为管理员
    if (user.role === '1') {
      // 用户名密码都匹配后，将用户信息存入 session
    req.session.user = user;
    req.flash('success', '登录成功!');
      return res.redirect('/g_petadd');//用户为管理员跳转到管理页
    }else {
      // 用户名密码都匹配后，将用户信息存入 session
    req.session.user = user;
    req.flash('success', '登录成功!');
    return res.redirect('/y_personcom');
    }
    
    });
});

    app.get('/logout', checkLogin);
    app.get('/logout', function (req, res) {
      req.session.user = null;
      res.redirect('/');
    });




    app.get('/y_person', checkLogin);
    app.get('/y_person', function (req, res) {

      var username = req.session.user.name;

      User.get(username, function (err, user) {

        res.render('y_person', {
          title:'个人中心',
          user: user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });

      });
      
    });

    app.post('/y_person', checkLogin);
    app.post('/y_person', function(req, res){

      var username = req.session.user.name;
      var password = req.body.password;
      var password_re = req.body.repassword;

    //检验用户两次输入的密码是否一致
    if (password_re != password) {
      req.flash('error', '两次输入的密码不一致!');
      return res.redirect('/person');
    }
    
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
        password = md5.update(password).digest('hex');

    var obj={
        password: password,
        email: req.body.email
       }
       console.log(password);
      User.update(username, obj, function (err) {
        if (err) {
          console.log(err);
        }else {
           console.log(username);
        }
      });
    });


    function checkLogin(req, res, next) {
      if (!req.session.user) {
        req.flash('error', '未登录!请先登录！');
        res.redirect('/login');
      }
      next();
      }
    function checkNotLogin(req, res, next) {
      if (req.session.user) {
        req.flash('error', '已登录!');
        res.redirect('back');
      }
      next();
      }
    
    function checkUser(req, res, next) {
      if (req.session.user.role == '0' ) {
        req.flash('error', '您没有权限!');
        res.redirect('back');
      }
      next();
    }



    app.get('/y_postadd', function (req, res) {
      var username = req.session.user.name;
      User.get(username, function (err, user) {
        res.render('y_postadd', {
          title: '流浪信息消息发布',
          user: user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    });

    app.post('/y_postadd', mutipartMiddeware, function (req, res) {
      var targetPath = './public/images/' + req.files.picture.originalFilename;
      var tmpPath = req.files.picture.path;
        // 重命名为真实文件名
      fs.rename(tmpPath, targetPath, function(err) {
        if(err){
          console.log('rename error: ' + err);
        } else {
          console.log('rename ok');
        }
        });
      var currentUser = req.session.user,
      post = new Post(req.body.title, req.body.losttime, req.body.phone, req.body.post, req.files.picture.name);
      post.save(function (err) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        req.flash('success', '发布成功!');
        res.redirect('/y_postadd');
      });
    });

    app.get('/g_postadd', function (req, res) {
      var username = req.session.user.name;
      User.get(username, function (err, user) {
        res.render('g_postadd', {
          title: '公告发布',
          user: user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    });

    app.post('/g_postadd', mutipartMiddeware, function (req, res) {
        //kindeditor图片上
      if (req.body.sure) {
        var currentUser = req.session.user,
        post = new Post(req.body.title, req.body.losttime, req.body.phone, req.body.post);
        post.save(function (err) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        req.flash('success', '发布成功!');
        res.redirect('/g_postadd');
      });
      }else {
        var fname = req.files.imgFile.name;
          fs.rename(req.files.imgFile.path, './public/images/' + fname);

          var url = '/images/' + fname;
          var info = {
            "error":0,
            "url":url
          };
          res.send(info);
        }
    });

    app.get('/g_postmanage', function (req, res) {
      //判断是否是第一页，并把请求的页数转换成 number 类型
      var page=req.query.p?parseInt(req.query.p):1;
      //查询并返回第 page 页的 8 篇文章
      Post.getTen(null,page, function (err, posts, total) {
        if (err) {
          posts = [];
        }
        res.render('g_postmanage', {
          title:'管理走失宠物信息',
          page:page,
          total,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 8 + posts.length) == total,
          user: req.session.user,
          posts: posts,				
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    });

    app.post('/g_postmanage', function(req, res){
      });

    app.get('/g_newsadd', function (req, res) {
      var username = req.session.user.name;
      User.get(username, function (err, user) {
        res.render('g_newsadd', {
          title: '新闻发布',
          user: user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    });

    app.post('/g_newsadd', mutipartMiddeware, function (req, res) {
      //kindeditor图片上
      if (req.body.sure) {
          var currentUser = req.session.user,
        newpost = new Newpost(req.body.title, req.body.introduce, req.files.picture.originalFilename, req.body.text);
        console.log(req.files.picture);
        newpost.save(function (err) {
          if (err) {
            req.flash('error', err);
            return res.redirect('/');
          }
          req.flash('success', '发布成功!');
          res.redirect('/g_newsadd');
        });
      }else {
        var fname = req.files.imgFile.name;
          fs.rename(req.files.imgFile.path, './public/images/' + fname);

          var url = '/images/' + fname;
          var info = {
            "error":0,
            "url":url
          };
          res.send(info);
        }
    });

    app.get('/g_newsmanage', function (req, res) {
      //判断是否是第一页，并把请求的页数转换成 number 类型
      var page=req.query.p?parseInt(req.query.p):1;
      //查询并返回第 page 页的 8 篇文章
      Newpost.getTen(null, page, function (err, newposts, total) {
        if (err) {
          newposts = [];
        }
        res.render('g_newsmanage', {
          title:'新闻管理',
          page:page,
          total,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 8 + newposts.length) == total,
          user: req.session.user,
          newposts: newposts,				
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    });

    app.post('/g_newsmanage', function(req, res){
      });



    app.get('/g_users', function (req, res) {
      //判断是否是第一页，并把请求的页数转换成 number 类型
      var page=req.query.p?parseInt(req.query.p):1;
      //查询并返回第 page 页的 8 篇文章
      User.getTen(null, page, function (err, users, total) {
        if (err) {
          users = [];
        }
        res.render('g_users', {
          title:'管理用户',
          page:page,
          total,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 8 + users.length) == total,
          users: users,				
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    });

    app.post('/g_users', function(req, res){
    });

    app.get('/g_petmanage', checkLogin);
    app.get('/g_petmanage', function (req, res) {
      //判断是否是第一页，并把请求的页数转换成 number 类型
      var page=req.query.p?parseInt(req.query.p):1;
      //查询并返回第 page 页的 8 篇文章
      Pet.getTen(null, page, function (err, pets, total) {
        if (err) {
          pets = [];
        }
        res.render('g_petmanage', {
          title:'管理宠物信息',
          page:page,
          total,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 8 + pets.length) == total,
          user: req.session.user,
          pets: pets,				
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    });

    app.post('/g_petmanage', checkLogin);
    app.post('/g_petmanage', function(req, res){
    });
    
    app.get('/g_petadd', checkUser);
    app.get('/g_petadd', checkLogin);
    app.get('/g_petadd', function (req, res) {
        res.render('g_petadd', {
          title:'添加宠物信息',
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
      });
      });
    
    app.post('/g_petadd', checkLogin);
    app.post('/g_petadd', checkUser);
    app.post('/g_petadd', mutipartMiddeware, function(req, res){
      var pic=new Array();
       if(req.files.picture==undefined){
        res.send("请选择要上传的图片...");
        }else{
        var str="文件上传成功...";
        for(var i=0; i<req.files.picture.length; i++){
            var targetPath = './public/images/' + req.files.picture[i].originalFilename;
            // console.log(req.files.picture);
            // console.log(targetPath);
            fs.rename(req.files.picture[i].path, targetPath, function(err) {
              if(err){
                console.log('rename error: ' + err);
              } else {
                console.log('rename ok');
              }
            });
            
                pic[i] = req.files.picture[i].name;
        }
        console.log(pic);
            // res.send("上传的图片成功...");
            
            // console.log(req.files.picture.length);           
    }
      
     
      var obj = {
        name: req.body.name,
        category: req.body.category,
        age: req.body.age,
        sex: req.body.sex,
        area: req.body.area,
        text: req.body.text,
        picture: pic
      }

      var pet = new Pet(obj);
      pet.save(function (err, pet) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        console.log(pet);
        req.flash('success', '发布成功!');
        res.redirect('/g_petadd');

      });
    });


  app.get('/petdetail', function (req, res) {
    res.render('petdetail', {
      title:'宠物详情',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
      });
  });
  app.post('/petdetail', function(req, res){
  });

  app.get('/petinfo', function (req, res) {
    //判断是否是第一页，并把请求的页数转换成 number 类型
      var page=req.query.p?parseInt(req.query.p):1;
      //查询并返回第 page 页的 6 
      Pet.getTen(null, page, function (err, pets, total) {
        if (err) {
          pets = [];
        }
      res.render('petinfo', {
         title:'宠物信息',
          page:page,
          total,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 6 + pets.length) == total,
          user: req.session.user,
          pets: pets,				
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
      
  });

  app.post('/petinfo', function(req, res){
  });

  app.get('/lostinfo', function (req, res) {
    //判断是否是第一页，并把请求的页数转换成 number 类型
      var page=req.query.p?parseInt(req.query.p):1;
      //查询并返回第 page 页的 10 篇文章
      Post.getTen(null, page, function (err, posts, total) {
        if (err) {
          posts = [];
        }
      res.render('lostinfo', {
          title:'走失信息',
          page:page,
          total,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 10 + posts.length) == total,
          user: req.session.user,
          posts: posts,				
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });  
});

  app.post('/lostinfo', function(req, res){
  });

    app.get('/newsinfo', function (req, res) {
    //判断是否是第一页，并把请求的页数转换成 number 类型
      var page=req.query.p?parseInt(req.query.p):1;
      //查询并返回第 page 页的 10 篇文章
      Newpost.getTen(null, page, function (err, newposts, total) {
        if (err) {
          newposts = [];
        }
        Post.get(null,function (err, posts, total) {
        if (err) {
          posts = [];
        }
      res.render('newsinfo', {
          title:'新闻动态',
          page:page,
          total,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 10 + posts.length) == total,
          user: req.session.user,
          posts: posts,
          newposts: newposts,				
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });  
    });
  });

  app.post('/newsinfo', function(req, res){
  });

  app.get('/about', function (req, res) {
    res.render('about', {
      title:'宠物百科',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
  });
  });
  app.post('/about', function(req, res){
  });


    app.get('/aboutus', function (req, res) {
    res.render('aboutus', {
      title:'关于我们',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
  });
  });
  app.post('/aboutus', function(req, res){
  });

  app.get('/g_petmodify/:_id', function (req, res) {

    Pet.getOne(req.params._id, function (err, pet) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('g_petmodify', {
        title: '宠物信息修改',
        pet: pet,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.post('/g_petmodify/:_id', function(req, res){

      var obj = {
        "name": req.body.name,
        "category":req.body.category,
        "age":req.body.age,
        "sex": req.body.sex,
        "area":req.body.area,
        "text":req.body.text
      }
      Pet.updateOne(req.body.petId, obj, function (err) {

        if (err) {
          return res.redirect('/g_petmanage');
        }else {
          return res.redirect('/g_petmanage');
        }

      });
  });

  app.get('/delete/:flag/:_id', function (req, res) {
    
   res.render('delete', {
        title: '删除信息确认',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
  });


  app.post('/delete/:flag/:_id', function(req, res){

    var Id = req.params._id;
    var flag = req.params.flag;

    //确定
      if (req.body.sure){

        //删除公告
        if (flag == 'a') {
            Post.removeOne(Id, function (err) {
              if (err) {
                console.log(err);
                return res.redirect('/g_postmanage');
              }else {
                return res.redirect('/g_postmanage');
              }
            });
        }

        //删除宠物信息
        if (flag == 'b') {
            Pet.removeOne(Id, function (err) {
              if (err) {
                console.log(err);
                return res.redirect('/g_petmanage');
              }else {
                return res.redirect('/g_petmanage');
              }
            });
        }

        //删除申请信息
        if (flag == 'c') {
            Apply.removeOne(Id, function (err) {
              if (err) {
                console.log(err);
                return res.redirect('/y_personapply');
              }else {
                return res.redirect('/y_personapply');
              }
            });
        }

         //删除用户信息
        if (flag == 'd') {
            User.removeOne(Id, function (err) {
              if (err) {
                console.log(err);
                return res.redirect('/g_users');
              }else {
                return res.redirect('/g_users');
              }
            });
        }

        //删除新闻信息
        if (flag == 'e') {
            Newpost.removeOne(Id, function (err) {
              if (err) {
                console.log(err);
                return res.redirect('/g_newsmanage');
              }else {
                return res.redirect('/g_newsmanage');
              }
            });
        }

    }else{
      return res.redirect('/');
    }  
  });

   app.get('/y_personcom', checkLogin);
   app.get('/y_personcom', function (req, res) {
      
      var username = req.session.user.name;
      User.get(username, function (err, user) {

        res.render('y_personcom', {
          title:'完善个人信息',
          user: user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });

      });
    });



  app.post('/y_personcom', checkLogin);
  app.post('/y_personcom', mutipartMiddeware,  function(req, res){
    
    var targetPath = './public/images/' + req.files.picture.originalFilename;
      var tmpPath = req.files.picture.path;
        // 重命名为真实文件名
      fs.rename(tmpPath, targetPath, function(err) {
        if(err){
          console.log('rename error: ' + err);
        } else {
          console.log('rename ok');
          
        }
        });
     var username = req.session.user.name;
      var obj = {
        tname: req.body.tname,
        phone:req.body.phone,
        address:req.body.address,
        salary: req.body.salary,
        adopt:req.body.adopt,
        text:req.body.text,
        picture: req.files.picture.name
      };

      User.update(username, obj, function (err) {
        if (err) {
          console.log(err);
          return res.redirect('/y_personcom');
          
        }else {
          return res.redirect('/');
          
        }
        // console.log(req.files);
        // console.log(tmpPath);
        // console.log(targetPath);
        // console.log(req.files.picture.name)
      });
  });


 app.get('/y_applylist/:_id', function (req, res) {

    Pet.getOne(req.params._id, function (err, pet) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('y_applylist', {
        title: '申请',
        pet: pet,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.post('/y_applylist/:_id', function(req, res){
      var currentUser = req.session.user;
      var newApply = new Apply(currentUser.name, req.params._id, '待审核');

      //检查动物是否已经存在
      Apply.getOne(req.params._id, currentUser.name , function (err, applys) {
        
        //如果不存在则新增申请
        if (applys.length) {
          req.flash('error', '已经申请此宠物！');
          return res.redirect('/y_personapply');
        }else {

          //如果不存在则不新增申请
          newApply.save(function (err) {
            if (err) {
              req.flash('error', err);
              return res.redirect('/');
            }
            req.flash('success', '发布成功!');
            res.redirect('/y_personapply');
          });
        }
      });
});



  app.get('/y_personapply', checkLogin);
  app.get('/y_personapply', function (req, res) {
    var username = req.session.user.name;

     User.get(username, function (err, user) {
        if (err || user) {

            Apply.get(username, function (err, applys){
              if (err) {
                applys = [];
              }
            
              res.render('y_personapply', {
                title:'我的申请',
                user: user,
                applys:applys,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
              });
          });
        }else {
          return res.redirect('/y_personapply');
        }
    });
    
     
  });
  
    app.post('/y_personapply', checkLogin);
    app.post('/y_personapply', function(req, res){
    });


    app.get('/g_applycheck', function (req, res) {
      //判断是否是第一页，并把请求的页数转换成 number 类型
      var page=req.query.p?parseInt(req.query.p):1;
      //查询并返回第 page 页的 8 篇文章
      Apply.getTen(null, page, function (err, applys, total) {
        if (err) {
          applys = [];
        }
        res.render('g_applycheck', {
          title:'审核申请',
          page:page,
          total,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 8 + applys.length) == total,
          user: req.session.user,
          applys: applys,				
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
  });
  
  app.post('/g_applycheck', function(req, res){
  });


  app.get('/g_applydetail/:username/:petid', function (req, res) {

      //查询当前点击跳转用户的所有信息
      User.get(req.params.username, function (err, user) {

         res.render('g_applydetail', {
          title:'申请详情',
          user: user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
  });
  
  app.post('/g_applydetail/:username/:petid', function(req, res){

      //修改信息的已知条件
      var obj1 = {
        petid: req.params.petid,
        username: req.params.username
      }
      var obj = {
        "state": req.body.state
      }
      Apply.updateOne(obj1, obj, function (err) {
        if (err) {
          return res.redirect('/g_applycheck');
        }else {
          return res.redirect('/g_applycheck');
        }
      });
  });


  app.get('/lostdetail/:_id', function (req, res) {

    Post.getOne(req.params._id, function (err, post) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('lostdetail', {
        title: '宠物走失信息详情',
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  app.post('/lostdetail/:_id', function(req, res){
  });

  app.get('/newsdetail/:_id', function (req, res) {

    Newpost.getOne(req.params._id, function (err, newpost) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('newsdetail', {
        title: '新闻详情',
        newpost: newpost,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  app.post('/newsdetail/:_id', function(req, res){
  });
  
  app.get('/petdetail/:_id', function (req, res) {

    Pet.getOne(req.params._id, function (err, pet) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('petdetail', {
        title: '宠物信息详情',
        pet: pet,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.post('/petdetail/:_id', function(req, res){
  });


}         
)}

  )}
