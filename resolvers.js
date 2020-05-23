const db = require('./db');
const jwtSecret = Buffer.from('Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt', 'base64');
const expressJwt = require('express-jwt'); //auth
const jwt = require('jsonwebtoken');
const Query = {
   test: () => 'Test Success, GraphQL server is up & running !!',
   greeting: () => 'Hello GraphQL  From greeting !!',
   student : ()=> db.students.list(),
   getOneStudent:(root,args,context,info) =>{
      var found = db.students.entities.find(function(element) {
        return element.id == args.id;
      });
      return found;
   },
   greetingWithAuth:(root,args,context,info) => {
      //check if the context.user is null
      if (!context.user) {
         throw new Error('Unauthorized');
      }
      return "Hello from Tutorials Point, welcome back : "+context.user.firstName;
   }
}

const Student = {
   fullName:(root,args,context,info) => {
      return root.firstName+":"+root.lastName
   },
   collage:(root) => {
      return db.colleges.get(root.collegeId);
   }
}

const Mutation = {
   createStudent:(root,args,context,info) => {
      return db.students.create({collegeId:args.collegeId,
         firstName:args.firstName,
         lastName:args.lastName,
         email: args.email,
         password : args.password
     	})
   },
   deleteStudent:(root,args,context,info) => {
      return db.students.delete(args.id);
   },
   signUp:(root,args,context,info) => {
      const {email,firstName,password} = args.input;
      const emailExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; 
      const isValidEmail =  emailExpression.test(String(email).toLowerCase())
      if(!isValidEmail)
      throw new Error("email not in proper format")

      if(firstName.length > 15)
      throw new Error("firstName should be less than 15 characters")

      if(password.length < 8 )
      throw new Error("password should be minimum 8 characters")
      
      return "success";
   },
   updateStudent:(root,args,context,info) => {
      return db.students.update({id:args.id, collegeId:args.collegeId,
         firstName:args.firstName,
         lastName:args.lastName,
         email: args.email,
         password : args.password
      })
   },
   login:(root,args,context,info)=>{
     const {email,firstName,password} = args.input;
     
     const user = db.students.list().find((user) =>  user.email === email);
     if (!(user && user.password === password)) {
         throw new Error("Unauthorized")
      
     }
     const token = jwt.sign({sub: user.id}, jwtSecret);
     //res.send({token});
     return token;
   },
}
function newLinkSubscribe(parent, args, context, info) {
  return context.prisma.$subscribe.createStudent({ mutation_in: ['CREATED'] }).node()
}

const Subscription ={
  newLink:(root,args,context,info)=>{
    return "test";
  }
}




  


module.exports = {Query,Student,Mutation,Subscription} 


