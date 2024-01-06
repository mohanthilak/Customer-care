const ErrorResponse = (message, error, status, data, res)=>{
    console.log(message+": "+ error);
    res.status(status).json(data)
}