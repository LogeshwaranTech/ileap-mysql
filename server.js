const bodyParser = require('body-parser');
const express = require('express');
const mysql = require('mysql');
require('dotenv').config();




const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`server listening port ${port}`);
});

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: 'root',
    password: 'logesh17793',
    database: 'ileap'
});


connection.connect( (err) => {
    if(!err){
        console.log("Database Conected");
    }else{
        console.log("DB conection Faild",err);
    }    
});



app.post('/api/v1/attempt', async (req, res) => {
    try {
      const {user_id , assessment_code } = req.body;
      if(!user_id || !assessment_code){
        return res.status(400).json(
            {
              status : 400,
              message:`${"Request body should have user_id , assessment_code as Json"}`,
              data : []
            }
          );
      }
      
      connection.query(`select id from assessments where assessment_code = ?`, assessment_code, (error, results)=>{
        if(results.length == 0) {
            return res.status(404).json(
              {
                status : 404,
                message:`${"assessment_code : " + assessment_code + " not avaialble"}`,
                data : []
              }
            );
          }
        
        let obj = JSON.stringify(results);     
        let obj2 = JSON.parse(obj);          
        let id ;
          obj2.some((get)=>{          
             id = get.id;
        })
          connection.query(`insert into Attempt (user_id,assessment_id)values (?,?)`,[user_id,id],(error, results)=>{           
            

            if(results.affectedRows>0){
            connection.query(`select asm.assessment_code, qs.question, op.option from assessments as asm
                            join questions as qs on asm.id = qs.assessment_id
                            join options as op on op.question_id = qs.id
                            where asm.assessment_code = ?`,assessment_code,(error, results)=>{
            if(results.length >0){
                res.status(200).json(
                    {
                     status : 200,
                     message:"",
                     data : results
                    }
                  );
                }
            })
            } 
          })
      });     
    
    }catch (err) {
      res.status(500).json({
        status : 500,
        message:err.message,
        data : []
       });
    }
  });