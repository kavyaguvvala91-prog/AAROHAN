const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found.',
  });
};

module.exports = notFound;
