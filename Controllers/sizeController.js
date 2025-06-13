// Developed by M.Vaishnavi | Start: 01/4 | End: 02/4

const { Size } = require("../models"); // Import the Size model

// Create a new size
exports.createSize = async (req, res) => {
    try {
        const { size } = req.body; // Extract the size from the request body

        // Define valid sizes for validation
        const validSizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

        // Check if the provided size is valid
        if (!validSizes.includes(size)) {
            return res.status(400).json({ error: "Invalid size. Allowed sizes are S, M, L, XL, XXL, XXXL." });
        }

        // Create the new size entry in the database
        const newSize = await Size.create({ size });

        // Respond with the newly created size
        res.status(201).json(newSize);
    } catch (error) {
        console.error(error); // Log error for debugging
        res.status(400).json({ error: error.message }); // Respond with the error message
    }
};

// Get all sizes
exports.getSizes = async (req, res) => {
    try {
        // Fetch all size entries from the database
        const sizes = await Size.findAll();

        // Respond with the list of sizes
        res.status(200).json(sizes);
    } catch (error) {
        res.status(400).json({ error: error.message }); // Handle any errors
    }
};

// Get a specific size by ID
exports.getSizeById = async (req, res) => {
    try {
        // Find the size by its ID
        const size = await Size.findByPk(req.params.id);

        // If no size is found, return a 404 error
        if (!size) {
            return res.status(404).json({ message: "Size not found" });
        }

        // Respond with the found size
        res.status(200).json(size);
    } catch (error) {
        res.status(400).json({ error: error.message }); // Handle errors
    }
};

// Update a size by ID
exports.updateSize = async (req, res) => {
    try {
        const { size } = req.body; // Extract the new size from the request body

        // Find the size to update by ID
        const sizeToUpdate = await Size.findByPk(req.params.id);

        // If the size is not found, return a 404 error
        if (!sizeToUpdate) {
            return res.status(404).json({ message: "Size not found" });
        }

        // Update the size
        sizeToUpdate.size = size;
        await sizeToUpdate.save(); // Save the updated size

        // Respond with the updated size
        res.status(200).json(sizeToUpdate);
    } catch (error) {
        res.status(400).json({ error: error.message }); // Handle any errors
    }
};

// Delete a size by ID
exports.deleteSize = async (req, res) => {
    try {
        // Find the size by ID
        const size = await Size.findByPk(req.params.id);

        // If no size is found, return a 404 error
        if (!size) {
            return res.status(404).json({ message: "Size not found" });
        }

        // Delete the size from the database
        await size.destroy();

        // Respond with a success message
        res.status(200).json({ message: "Size deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message }); // Handle any errors
    }
};
