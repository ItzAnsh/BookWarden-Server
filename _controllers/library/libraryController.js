import Library from "../../_models/Library/library.model.js";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler.js";

const createLibrary = AsyncErrorHandler(async (req, res) => {
  const { name, location, contactNo, contactEmail, librarian } = req.body;

  if (!name || !location || !contactNo || !contactEmail || !librarian) {
    res.status(400);
  }

  const newLibrary = new Library({
    name,
    location,
    contactNo,
    contactEmail,
    librarian: mongoose.Types.ObjectId(librarian),
  });
  await newLibrary.save();
  res.send("Library Added Successfully");
});

const getAllLibraries = AsyncErrorHandler(async (req, res) => {
  const libraries = await Library.find();
  res.send(libraries);
});

const getLibrary = AsyncErrorHandler(async (req, res) => {
  const { libraryId } = req.params;
  if (!libraryId) {
    res.status(400);
  }

  const library = await Library.findById(libraryId);

  if (!library) {
    res.status(400);
  }
  res.send(library);
});

const updateLibrary = AsyncErrorHandler(async (req, res) => {
  const { libraryId } = req.params;
  if (!libraryId) {
    res.status(400);
  }
  const { name, location, contactNo, contactEmail, librarian } = req.body;

  const updateLibrary = await Library.findByIdAndUpdate(
    { _id: mongoose.Types.ObjectId(libraryId) },
    { name, location, contactNo, contactEmail, librarian : mongoose.Types.ObjectId(librarian) }
  );

  if (!updateLibrary) {
    res.status(400);
  }

  res.send(updateLibrary);
});

const deleteLibrary = AsyncErrorHandler(async (req, res) => {
  const { libraryId } = req.params;
  if (!libraryId) {
    res.status(400);
  }

  const deleteLibrary = await Library.findByIdAndDelete({
    _id: mongoose.Types.ObjectId(libraryId),
  });
  if (!deleteLibrary) {
    res.status(400);
  }
  res.send(deleteLibrary);
});

export {
  createLibrary,
  getAllLibraries,
  getLibrary,
  updateLibrary,
  deleteLibrary,
};
