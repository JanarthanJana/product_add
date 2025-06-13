// Developed by M.Vaishnavi | Start: 01/4 | End: 02/4

const { Product, Category, Price, Barcode } = require("../models"); // Import Product and Category models
const db = require("../config/db"); // Import MySQL connection
const bwipjs = require("bwip-js"); // Barcode generator
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: {
        model: Category,
        as: "categorys",
      },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to fetch products", details: error.message });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{ model: Price, as: "prices" }],
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error("Error retrieving product:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Create a product
const createProduct = async (req, res) => {
  const { name, description, categorys_id } = req.body;

  try {
    const category = await Category.findByPk(categorys_id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const newProduct = await Product.create({
      name,
      description,
      categorys_id,
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to create product", details: error.message });
  }
};

// Function to generate barcode image
// Function to generate barcode image

const generateBarcode = async (barcode_no) => {
  const barcodeDir = path.join(__dirname, "../public/barcodes"); // <- public folder
  const barcodePath = path.join(barcodeDir, `${barcode_no}.png`);

  return new Promise((resolve, reject) => {
    // Ensure the folder exists
    fs.mkdir(barcodeDir, { recursive: true }, (err) => {
      if (err) return reject(err);

      bwipjs.toBuffer(
        {
          bcid: "code128",
          text: barcode_no,
          scale: 3,
          height: 10,
          includetext: true,
          textxalign: "center",
          backgroundcolor: "ffffff", // Sets white background
        },
        (err, buffer) => {
          if (err) return reject(err);

          fs.writeFile(barcodePath, buffer, (err) => {
            if (err) return reject(err);
            resolve(barcodePath); // or return relative path if needed for frontend
          });
        }
      );
    });
  });
};

//module.exports = generateBarcode;

// Add Product Function (Using Callbacks)
// const addProduct = async (req, res) => {
//   const {
//     name,
//     description,
//     categorys_id,
//     color_id,
//     size_id,
//     quantity,
//     cost_price,
//     selling_price,
//   } = req.body;

//   try {
//     // Insert into products table
//     const product = await Product.create({ name, description, categorys_id });

//     // Generate barcode
//     const barcode_no = `${product.id} ${color_id} ${size_id}`;
//     const barcode_image = await generateBarcode(barcode_no);

//     // Insert into barcodes table
//     const barcode = await Barcode.create({ barcode_no, barcode_image });

//     // Insert into prices table
//     await Price.create({
//       cost_price,
//       selling_price,
//       quantity,
//       barcode_id: barcode.id,
//       product_id: product.id,
//       color_id,
//       size_id,
//     });

//     res
//       .status(200)
//       .json({ message: "Product added successfully!", product, barcode });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error while adding product" });
//   }
// };

//module.exports = { addProduct };

// Update a product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, categorys_id } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await product.update({ name, description, categorys_id });

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Delete a product
// const deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const product = await Product.findByPk(id);
//     if (!product) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     // Step 1: Retrieve barcode IDs from deleted price entries
//     const barcodeIds = await Price.findAll({
//       attributes: ["barcode_id"],
//       where: { product_id: id },
//     });

//     // Extract barcode IDs into an array
//     const barcodeIdList = barcodeIds.map((entry) => entry.barcode_id);

//     // Step 2: Delete related price entries first
//     await Price.destroy({ where: { product_id: id } });

//     // Step 3: Delete barcodes linked to deleted price records
//     await Barcode.destroy({
//       where: { id: { [Op.in]: barcodeIdList } },
//     });

//     // Step 4: Delete the product itself
//     await product.destroy();

//     res
//       .status(200)
//       .json({
//         message:
//           "Product, related prices, and linked barcodes deleted successfully",
//       });
//   } catch (error) {
//     console.error("Error deleting product:", error);
//     res
//       .status(500)
//       .json({ error: "Internal server error", details: error.message });
//   }
// };

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Step 1: Retrieve barcode IDs from related price entries
    const barcodeEntries = await Price.findAll({
      attributes: ["barcode_id"],
      where: { product_id: id },
    });

    // Extract barcode IDs into an array
    const barcodeIdList = barcodeEntries.map((entry) => entry.barcode_id);

    // Step 2: Retrieve barcode entries to delete their images
    const barcodes = await Barcode.findAll({
      where: { id: { [Op.in]: barcodeIdList } },
    });

    // Step 3: Delete related price entries first
    await Price.destroy({ where: { product_id: id } });

    // Step 4: Delete barcode images from the filesystem
    barcodes.forEach((barcode) => {
      if (barcode.barcode_image) {
        // ✅ Ensure only the filename is used
        const barcodeImagePath = path.join(
          __dirname,
          "../public/barcodes",
          path.basename(barcode.barcode_image)
        );

        console.log(`Checking if file exists: ${barcodeImagePath}`);

        if (fs.existsSync(barcodeImagePath)) {
          fs.unlinkSync(barcodeImagePath); // ✅ Removes file safely
          console.log(`Deleted barcode image: ${barcodeImagePath}`);
        } else {
          console.warn(`Barcode image file not found: ${barcodeImagePath}`);
        }
      }
    });

    // Step 5: Delete barcode entries linked to deleted prices
    await Barcode.destroy({
      where: { id: { [Op.in]: barcodeIdList } },
    });

    // Step 6: Delete the product itself
    await product.destroy();

    res.status(200).json({
      message:
        "Product, related prices, barcodes, and barcode images deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

const addProductAttributes = async (req, res) => {
  const {
    product_id,
    color_id,
    size_id,
    quantity,
    cost_price,
    selling_price,
    barcode_id,
  } = req.body;

  console.log("Received product_id:", product_id, typeof product_id);

  try {
    if (!product_id || isNaN(product_id)) {
      return res.status(400).json({ error: "Invalid product_id provided!" });
    }

    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        error: `Product ID ${product_id} does not exist in the database!`,
      });
    }

    // Insert pricing details
    await Price.create({
      product_id,
      color_id,
      size_id,
      quantity,
      cost_price,
      selling_price,
      barcode_id,
    });

    res.status(200).json({
      message: "Attributes added successfully!",
      product_id,
      color_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while adding attributes" });
  }
};

// Add a new product
const addProduct = async (req, res) => {
  try {
    const { name, description, categorys_id } = req.body;

    if (!name || !description || !categorys_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Check if the product already exists
    const existingProduct = await Product.findOne({ where: { name, categorys_id } });
    if (existingProduct) {
      return res.status(409).json({ error: "Product already exists" });
    }

    // Insert product using Sequelize ORM
    const product = await Product.create({ name, description, categorys_id });

    res.status(201).json({ message: "Product added successfully", product_id: product.id });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

// Add pricing details & generate barcode
const addPricing = async (req, res) => {
  try {
    const { product_id, variations } = req.body;

    if (!product_id || !variations.length) {
      return res
        .status(400)
        .json({ error: "Product ID and variations are required" });
    }

    for (const variant of variations) {
      const { color_id, size_id, quantity, cost_price, selling_price } =
        variant;

      // Generate barcode
      const barcode_no = `${product_id} ${color_id} ${size_id}`;
      const barcode_image = await generateBarcode(barcode_no);

      // Insert into barcodes table
      const barcode = await Barcode.create({ barcode_no, barcode_image });

      // Insert into prices table
      await Price.create({
        cost_price,
        selling_price,
        quantity,
        barcode_id: barcode.id, // Store barcode_id reference
        product_id,
        color_id,
        size_id,
      });
    }

    res
      .status(201)
      .json({ success: true, message: "All variations saved successfully!" });
  } catch (error) {
    console.error("Unexpected error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

const editPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { color_id, size_id, quantity, cost_price, selling_price } = req.body;

    console.log("URL Params:", req.params);
    console.log("Incoming request data:", req.body);

    // Step 1: Find the price entry using the ID from the URL
    const price = await Price.findByPk(id);
    if (!price) {
      return res.status(404).json({ error: "Price entry not found" });
    }

    console.log("Existing price entry before update:", price);

    // Step 2: Check if color_id or size_id has changed
    const colorChanged = color_id !== undefined && color_id !== price.color_id;
    const sizeChanged = size_id !== undefined && size_id !== price.size_id;

    // Step 3: Update the price entry in the database
    await price.update({
      cost_price: cost_price !== undefined ? cost_price : price.cost_price,
      selling_price:
        selling_price !== undefined ? selling_price : price.selling_price,
      quantity: quantity !== undefined ? quantity : price.quantity,
      color_id: color_id !== undefined ? color_id : price.color_id,
      size_id: size_id !== undefined ? size_id : price.size_id,
    });

    await price.reload(); // Ensure latest data is retrieved

    console.log("Updated price entry:", price);

    // Step 4: Find the associated barcode entry
    const barcode = await Barcode.findByPk(price.barcode_id);
    if (!barcode) {
      return res
        .status(404)
        .json({ error: "Barcode not found for this price entry" });
    }

    console.log("Existing barcode entry:", barcode);

    // Step 5: Regenerate barcode image only if color_id or size_id has changed
    if (colorChanged || sizeChanged) {
      console.log(
        `Regenerating barcode for ID ${price.barcode_id} due to color/size change.`
      );
      const newBarcodeNo = `${price.product_id} ${price.color_id} ${price.size_id}`;
      const newBarcodePath = await generateBarcode(newBarcodeNo);

      // Step 6: Update barcode record with new image
      await barcode.update({
        barcode_no: newBarcodeNo,
        barcode_image: newBarcodePath,
      });

      console.log("New barcode image path:", newBarcodePath);

      return res.status(200).json({
        success: true,
        message: "Price and barcode updated successfully!",
        updated_price: price,
        updated_barcode: barcode,
        barcode_image: newBarcodePath,
      });
    }

    res.status(200).json({
      success: true,
      message: "Price updated successfully (Barcode unchanged)",
      updated_price: price,
    });
  } catch (error) {
    console.error("Error updating pricing variations:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

const deletePrice = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Find the price entry
    const price = await Price.findByPk(id);
    if (!price) {
      return res.status(404).json({ error: "Price entry not found" });
    }

    console.log("Existing price entry before deletion:", price);

    // Step 2: Find the associated barcode entry
    const barcode = await Barcode.findByPk(price.barcode_id);
    if (barcode) {
      console.log("Existing barcode entry before deletion:", barcode);

      // Step 3: Delete barcode image from the filesystem
      if (barcode.barcode_image) {
        const barcodeImagePath = path.join(__dirname, "../public/barcodes", path.basename(barcode.barcode_image));
        
        console.log(`Checking if file exists: ${barcodeImagePath}`);

        if (fs.existsSync(barcodeImagePath)) {
          fs.unlinkSync(barcodeImagePath); // ✅ Removes barcode image file
          console.log(`Deleted barcode image: ${barcodeImagePath}`);
        } else {
          console.warn(`Barcode image file not found: ${barcodeImagePath}`);
        }
      }

      // Step 4: Delete barcode entry from database
      await barcode.destroy();
    }

    // Step 5: Delete the price entry itself
    await price.destroy();

    res.status(200).json({ 
      success: true, 
      message: "Price and related barcode deleted successfully!" 
    });

  } catch (error) {
    console.error("Error deleting price entry:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

const getPrice = async (req, res) => {
  try {
    const { id } = req.params;

    const price = await Price.findByPk(id, {
      include: [{ model: Barcode, as: "barcode" }] // ✅ Match the alias exactly
    });

    if (!price) {
      return res.status(404).json({ error: "Price entry not found" });
    }

    // Extract barcode details using the correct alias
    const barcodeDetails = price.barcode
      ? {
          barcode_no: price.barcode.barcode_no,
          barcode_image: `/public/barcodes/${path.basename(price.barcode.barcode_image)}`
        }
      : null;

    res.status(200).json({
      success: true,
      price,
      barcode: barcodeDetails
    });

  } catch (error) {
    console.error("Error fetching price details:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};






//module.exports = { addProductAttributes };

module.exports = {
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductAttributes,
  createProduct,
  addProduct,
  addPricing,
  editPrice,
  deletePrice,
  getPrice,
};
