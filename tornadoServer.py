import os
import json
# import subprocess
from urlparse import urlparse
from tornado.escape import json_encode, json_decode
import tornado.options
import tornado.httpserver
import tornado.ioloop
import tornado.web

class MainHandler(tornado.web.RequestHandler):
    # def initialize(self, tasks, count_task):
    #     """Init MainHandler class with tasks and count tasks."""
    #     self.tasks = tasks
    #     self.count_task = count_task
    def get(self):
        # client_query = urlparse(self.request.uri).query
        # query_value = client_query.split('&_')[0]
        # result = subprocess.Popen(['sh', 'delay_search.sh'], stdout=subprocess.PIPE, env={"QUERY_STRING" : query_value})
        # result_file = json_encode(result.stdout.read())
        
        # TODO add download and send file to client
        # self.count_task = self.count_task + 1
    



        self.write("good choise")
        self.finish()

    def put(self):
        print "PUT by MainHandler"
        file = open(os.path.abspath('.') + urlparse(self.request.uri).path, 'w+') 
        print "self.request.body"
        download = tornado.escape.json_decode(self.request.body)
        file.write(download)
        file.close()
        self.finish()
        
class TaskHandler(tornado.web.RequestHandler):
    def initialize(self, tasks, count_task):
        """Init MainHandler class with tasks and count tasks."""
        self.tasks = tasks
        self.count_task = count_task
    def get(self):

        print "GET by TaskHandler"
        if self.count_task > len(self.tasks):
          print "!! There is end of tasks!!"

        elif self.count_task == len(self.tasks):
          print(len(self.tasks), "len");
          task = tasks[self.count_task]
          response_task = task.update({"end" : "end"}) 
          self.write(json.dumps(response_task))
          self.count_task = self.count_task + 1
          self.finish()
        else :
          # task = tasks[self.count_task]
          # response_task = task.update({"end" : "end"})
          self.write(json.dumps(tasks[self.count_task]))
          self.count_task = self.count_task + 1
          self.finish()
            

class EachInputHandler(tornado.web.RequestHandler):
    def get(self):
        print "GET by EachInputHandler"
        print " Success download input files"
        file = open(os.path.abspath('.') + urlparse(self.request.uri).path)
        fileread = file.read()
        print "file xxx", fileread
        self.write(json.dumps(fileread))
        
        self.finish()
        file.close()

class MyStaticFileHandler(tornado.web.StaticFileHandler):
    def set_extra_headers(self, path):
        # Disable cache
        self.set_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')

class MainHandler2(tornado.web.RequestHandler):
    @tornado.web.authenticated
    def get(self):
        self.render("RunChainCalc.html", messages="global_message_buffer.cache")

    


if __name__ == "__main__":
  tasks = [{
      "matrix1": "/inputs/1-1.txt",
      "matrix2": "/inputs/1-2.txt",
      "operation": "+",
      "result_uri": "/results/1.txt"
    },
    {
      "matrix1": "/inputs/1-1.txt",
      "matrix2": "/inputs/1-2.txt",
      "operation": "-",
      "result_uri": "/results/2.txt"
    },
    {
      "matrix1": "/inputs/1-1.txt",
      "matrix2": "/inputs/1-2.txt",
      "operation": "*",
      "result_uri": "/results/3.txt"
    },
    {
      "matrix1": "/inputs/2-1.txt",
      "matrix2": "/inputs/2-2.txt",
      "operation": "+",
      "result_uri": "/results/4.txt"
    }
  ] 
  count_task = 0
  application = tornado.web.Application([
    # (r"/index2.html", MainHandler, dict(tasks=tasks, count_task=count_task)),
    # (r"/RunChainCalc.html", MainHandler),
        # MyStaticFileHandler, {"path": os.path.abspath('.'), "default_filename": "RunChainCalc.html"}),
    (r"/tasks/", TaskHandler, dict(tasks=tasks, count_task=count_task)),
    (r"/inputs.*", EachInputHandler),        
    # (r"/inputs.*", MyStaticFileHandler),        
    (r"/results.*", MainHandler),        
    # (r"/", MainHandler2),        
    (r"/(.*)",  MyStaticFileHandler, {"path": os.path.abspath('.'), "default_filename": "RunChainCalc.html"})
      
  ])
  # tornado.web.StaticFileHandler

  http_server = tornado.httpserver.HTTPServer(application)
  http_server.listen(8800)
  tornado.options.parse_command_line()
  tornado.ioloop.IOLoop.instance().start()
