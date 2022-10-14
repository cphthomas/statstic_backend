index = async (req, res) => {
  res.send({
    data: { name: "aman" },
  });
};

indexPost = async (req, res) => {
  const { name } = req.body;
  res.send({
    data: { name: name },
  });
};

module.exports = {
  index,
  indexPost
};
