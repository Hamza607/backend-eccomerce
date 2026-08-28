const getCategory = (req, res) => {
  res.json({ success: true, message: `All Categories` });
};

const getCategoryById = (req, res) => {
  const { id } = req.params;
  res.json({ success: true, message: `Category with id ${id}` });
};

const createCategory = (req, res) => {
  res.json({ success: true, message: `Category Created`, body: req.body });
};

const updateCategory = (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: `Category with id ${id} Updated`,
    body: req.body,
  });
};

const deleteCategory = (req, res) => {
  const { id } = req.params;
  res.json({ success: true, message: `Category with id ${id} Deleted` });
};

module.exports = {
  getCategory,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
