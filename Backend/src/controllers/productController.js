const Product = require('../models/Product');

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            seller: req.user._id
        });

        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener todos los productos
exports.getProducts = async (req, res) => {
    try {
        const { category, search, sort } = req.query;
        let query = { isActive: true };

        // Filtrar por categoría
        if (category) {
            query.category = category;
        }

        // Buscar por título o descripción
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Ordenar productos
        let sortOption = {};
        if (sort === 'price_asc') {
            sortOption = { price: 1 };
        } else if (sort === 'price_desc') {
            sortOption = { price: -1 };
        } else if (sort === 'rating') {
            sortOption = { rating: -1 };
        } else {
            sortOption = { createdAt: -1 };
        }

        const products = await Product.find(query)
            .sort(sortOption)
            .populate('seller', 'name');

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un producto específico
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name');
        
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar un producto
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        await product.remove();
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener productos por vendedor
exports.getSellerProducts = async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user._id })
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar calificación del producto
exports.updateProductRating = async (req, res) => {
    try {
        const { rating } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const newRating = (product.rating * product.numReviews + rating) / (product.numReviews + 1);
        product.rating = newRating;
        product.numReviews += 1;

        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 