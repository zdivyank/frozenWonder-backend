const validate = (schema) => async(req,res,next)=>{

    try {
        
        const parsedBody = await schema.parseAsync(req.body);
        req.body = parsedBody;
        next();
        
    } catch (err) {
       console.log(err);
       const status = 422;
       const msg = "Fill the Input Properly...";
       const extraDetails =err.errors[0].message; 

       
       const error = {
        status,
        msg,
        extraDetails
       }
    //    res.status(status).json({message : msg})
       next(error)
    }
}
module.exports = validate ;