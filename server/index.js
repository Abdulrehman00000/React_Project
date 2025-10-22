const express = require('express');
const cors = require('cors')
const application =express();
const PORT =process.env.PORT ||5000;
application.use(cors());
application.use(express.json());
application.get('/',(req,res)=>{
res.send('API Is working');
});
application.listen(PORT,()=>{
    console.log(`Server runing on http://localhost:${PORT}`);
})