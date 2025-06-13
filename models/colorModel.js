//Developed by M.Vaishnavi start 01/4 end 02/4

module.exports = (sequelize, DataTypes) => {
    // Define the Color model
    const Color = sequelize.define(
        "Color",
        {
            // Define the fields for the Color model
            id: {
                type: DataTypes.INTEGER, // The data type for the ID field
                primaryKey: true, // This field is the primary key
                autoIncrement: true, // Automatically increments when a new record is created
                allowNull: false, // This field cannot be null
            },
            colour_name: {
                type: DataTypes.STRING, // The data type for the colour_name field
                allowNull: false, // This field cannot be null
            },
        },
        {
            // Table-specific options
            tableName: "colors", // Specifies the name of the table in the database
            timestamps: true, // Automatically adds createdAt and updatedAt fields
            createdAt: "created_at", // Renames the createdAt field to created_at in the database
            updatedAt: "updated_at", // Renames the updatedAt field to updated_at in the database
        }
    );

    // Define the associations for this model
    Color.associate = (models) => {
        // One-to-many relationship with Price model
        Color.hasMany(models.Price, { foreignKey: "color_id", as: "Prices" });
    };

    // Return the Color model
    return Color;
};
