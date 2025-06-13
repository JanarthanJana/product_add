module.exports = (sequelize, DataTypes) => {
    const Size = sequelize.define(
        "Size",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            size: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isIn: [['S', 'M', 'L', 'XL', 'XXL', 'XXXL']],  // Only allow these values
                },
            }
        },
        {
            tableName: "sizes",
            timestamps: true,  // Not needed based on the diagram
            createdAt: "created_at", // Custom field name for creation timestamp
            updatedAt: "updated_at", // Custom field name for update timestamp
        }
    );

    Size.associate = (models) => {
        Size.hasMany(models.Price, { foreignKey: "size_id", as: "Prices" });
    };

    return Size;
};
