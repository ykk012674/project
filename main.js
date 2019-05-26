console.log('hello no daemo33n')
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
 var template = require('./lib/templete.js')
var path = require('path') ;
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    console.log('hello no daemon');
    if(pathname === '/'){
      if(queryData.id === undefined){
        fs.readdir('./data', function(error, filelist){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          
          // var list = template.list(filelist);
          // var template = templateHTML(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
          // response.writeHead(200);
          // response.end(html);
          
          var list = template.list(filelist);
          var html = template.html(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
          response.writeHead(200);
          response.end(html);
        });
      } else {
        fs.readdir('./data', function(error, filelist){
          var filteredId = path.parse(queryData.id).base;
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
            var title = queryData.id;
            var list = template.list(filelist);
            var html = template.html(title, list, `<h2>${title}</h2>${description}`,
             `<a href="/create">create</a> 
              <a href="/update?id=${title}">update</a> 
              <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <input type="submit" value="delete"> </form>`              
              );
            response.writeHead(200);
            response.end(html);
          });
        });
      }
    } else if(pathname === '/create'){
      fs.readdir('./data', function(error, filelist){
        var title = 'WEB - create';
        var list = template.list(filelist);
        var html = template.html(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, '');
        response.writeHead(200);
        response.end(html);
      });
    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var title = post.title;
          var description = post.description
          console.log(title);
          console.log(description);
   
         fs.writeFile (`data/${title}`, description, 'utf8', 
         function(err){
          response.writeHead(200);
          response.writeHead(302, {
            Location: `/?id=${title}`
          });
          response.end();
         });

      });
  
    } else if (pathname==='/update'){
      console.log('pathname=' + pathname)
      fs.readdir('./data', function(error, filelist){
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){

//        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = template.list(filelist);
          var html = template.html(title, list, 
            `
            <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}" ></p>
            <p><input type="text" name="title" value="${title}" placeholder="title"></p>
            <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
          `, `<a href="/create">create</a> <a href="/update?id=${title}">update</a>` );
          response.writeHead(200);
          response.end(html);
        });
      });
    }
    else if (pathname==='/update_process'){
      console.log('ykk update_process')
      var body = '';
      request.on('data', function (data) {
          body += data;
      });
      request.on('end', function () {
          var post = qs.parse(body);
          
          var id = post.id;
          var title = post.title;
          var description = post.description;

          fs.rename(`data/${id}`, `data/${title}`, function(err){
            fs.writeFile (`data/${title}`, description, 'utf8', 
            function(err){
            response.writeHead(200);
            response.writeHead(302, {
              Location: `/?id=${title}`
            });
            response.end();
            });
          });
      });
     } 
     else if (pathname==='/delete_process'){
      var body = '';
      request.on('data', function (data) {
          body += data;
      });
      request.on('end', function () {
        var post = qs.parse(body);
        var id = post.id;
        var filteredId = path.parse(id).base ;
       fs.unlink(`data/${filteredId}`, function(error){
          response.writeHead(302, {Location: `/` });
           response.end()
       })
     });
     } 
     else if(pathname === '/delete'){
       
      var id = queryData.id;
          fs.exists(`data/${id}`, function(exists) {
            if(exists) {
              //Show in green
             // console.log(gutil.colors.green('File exists. Deleting now ...'));
              fs.unlink(`data/${id}`, function(err){
                response.writeHead(200);
                response.writeHead(302, {Location: '/' });
              });
            } else             {
                console.log (`data/${id}`)
                response.end('file not found, so cant delete ');
            }
          });
 
    }

     else {
      response.writeHead(404);
      response.end('Not found');
    }
 
 
 
});
app.listen(3000);