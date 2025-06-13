const express = require("express");
const { connectDB } = require("./config/db"); // Import DB connection
const path = require('path');
const bodyParser = require('body-parser');

//Developed by M.Vaishnavi start 27/2 
const customerRoutes = require('./routes/customersRouter'); // Import customer routes

//Developed by M.Vaishnavi start 31/3 end 31/3
const productsRouter = require('./routes/productsRouter'); // Import the products router

const sizeRouter = require("./routes/sizesRouter"); // Import the size router

const colorsRouter = require("./routes/colorsRouter"); // Import the colors router

//Developed by M.Vaishnavi start 01/4 end 02/4
const categoriesRouter = require('./routes/categoriesRouter'); // Import the categories router

const productCategoryRouter = require('./routes/productCategoryRouter');  // Import the productCategory route

const priceRoutes = require("./routes/pricesRouter"); // Import the price route

const barcodeRoutes = require("./routes/barcodeRouter"); // Import the barcode route


const app = express();

app.use(bodyParser.json());

// categories Routes
app.use('/api/categories', categoriesRouter);

// size Routes
app.use("/sizes", sizeRouter);

// colors Routes
app.use("/colors", colorsRouter);

// productCategory Routes
app.use('/api/product-categories', productCategoryRouter);

// price Routes
app.use("/api/prices", priceRoutes);

// barcode Routes
app.use("/api/barcodes", barcodeRoutes);
app.use("/public", express.static("public")); // Serve barcode images

// products Routes
app.use('/products', productsRouter);


//Developed by M.Vaishnavi start 27/2 

// Middleware for parsing JSON
app.use(express.json());

// Routes for customer-related API
app.use('/api/customers', customerRoutes);

// 404 middleware for undefined routes
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});



const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();


app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port `);
});
