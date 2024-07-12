const asyncHandler = (requestHandler) => {
    return  (req, res, next) => {
       Promise
        .resolve(requestHandler(req, res, next))
       .catch((err)=>next(err));
    };
}
export { asyncHandler };


//USING TRY CATCH

// const asyncHandler = (fn) => async(req,res,next)=>{
//  try{}
//  catch(error){
//     res.status(err.code || 500).json({
//         succcess: false,
//         message: error.message || "Internal Server Error"
//     })
//  }
// }