// let content;

// const payloadContent = (payload) => {
//   const content = payload;
//   req.locals = payload;
//   console.log("Middleware payload....: ", req.locals);
//   console.log("Currently in OrderPayload Middleware");
//   console.log("Content: ", content);
//   return content;
// };

// module.exports = payloadContent;
// module.exports = { payloadContent, content }


const payload = (cb) => {
  return (req, res, next) => {
    req.locals = cb;
    console.log("Middleware Locals...: ", req.locals);
    next();
  }
}

module.exports = payload;