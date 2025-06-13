// //Developed by M.Vaishnavi start 01/4 end 02/4

// module.exports = (sequelize, DataTypes) => {
//   // Define the Product model
//   const Product = sequelize.define(
//     "Product", // Model name
//     {
//       // id: Unique identifier for each product
//       id: {
//         type: DataTypes.INTEGER, // Integer data type for the primary key
//         primaryKey: true, // Marks this field as the primary key
//         autoIncrement: true, // Automatically increments for each new record
//         allowNull: false, // This field cannot be null
//       },

//       // name: The name of the product
//       name: {
//         type: DataTypes.STRING, // String data type for the product name
//         allowNull: false, // This field is required
//       },

//       // description: An optional field for the product description
//       description: {
//         type: DataTypes.TEXT, // Text data type for product description
//         allowNull: true, // This field is optional
//       },

//       // categorys_id: A foreign key that references the Category model (Note: may be unnecessary with many-to-many)
//       categorys_id: {
//         type: DataTypes.INTEGER, // Integer data type for category ID
//         allowNull: false, // This field is required
//         references: {
//           model: "categorys", // Refers to the 'categorys' table in the database
//           key: "id", // Refers to the primary key of the 'categorys' table
//         },
//       },
//     },
//     {
//       // Table name and timestamps configuration
//       tableName: "products", // The table name in the database
//       timestamps: true, // Enable automatic timestamp tracking
//       createdAt: "created_at", // Custom field name for creation timestamp
//       updatedAt: "updated_at", // Custom field name for update timestamp
//     }
//   );

//   // Associations for the Product model
//   Product.associate = (models) => {
//     // Many-to-many relationship between Product and Category via ProductCategory junction table
//     Product.belongsToMany(models.Category, {
//       through: models.ProductCategory, // Reference to the junction table that links Product and Category
//       foreignKey: "product_id", // The foreign key in the junction table referring to Product
//       otherKey: "category_id", // The foreign key in the junction table referring to Category
//       as: "categorys", // Alias for the association (access through 'categorys')
//     });
//     Product.hasMany(models.Price, {
//       foreignKey: "product_id",
//       onDelete: "CASCADE",
//     });
//     Product.hasMany(models.Barcode, {
//       foreignKey: "product_id",
//       onDelete: "CASCADE",
//     });
//   };

//   // Return the Product model
//   return Product;
// };

// Developed by M.Vaishnavi start 01/4 end 02/4

module.exports = (sequelize, DataTypes) => {
  // Define the Product model
  const Product = sequelize.define(
    "Product",
    {
      // Primary Key: Unique identifier for each product
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // Product Name
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // Product Description
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      //categorys_id: A foreign key that references the Category model (Note: may be unnecessary with many-to-many)
      categorys_id: {
        type: DataTypes.INTEGER, // Integer data type for category ID
        allowNull: false, // This field is required
        references: {
          model: "categorys", // Refers to the 'categorys' table in the database
          key: "id", // Refers to the primary key of the 'categorys' table
        },
      },
    },
    
    {
      tableName: "products",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // Associations for the Product model
  Product.associate = function (models) {
    // Many-to-many relationship between Product and Category via ProductCategory junction table
    Product.belongsToMany(models.Category, {
      through: models.ProductCategory,
      foreignKey: "product_id",
      otherKey: "category_id",
      as: "categories", // Renamed alias for clarity
    });

    // One-to-Many relationship with Price (Cascade Delete Enabled)
    Product.hasMany(models.Price, {
      foreignKey: "product_id",
      onDelete: "CASCADE",
      hooks: true, // Ensures Sequelize enforces cascade delete
    });

    // One-to-Many relationship with Barcode (Cascade Delete Enabled)
    // Product.hasMany(models.Barcode, {
    //   foreignKey: "product_id",
    //   onDelete: "CASCADE",
    //   hooks: true,
    // });
  };

  return Product;
};
