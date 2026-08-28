const asynchandler = (conrtoller) => {
  return (req, res, next) => {
    Promise.resolve(conrtoller(req, res, next)).catch(next);
  };
};
module.exports = asynchandler;
