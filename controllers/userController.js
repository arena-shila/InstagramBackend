const User = require('../models/User'); // Apna User model path set karein

// Register karna
const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check  exist  nahi karta
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User pehle se registered hai.' });
        }

        const newUser = await User.create({ name, email, password });
        res.status(201).json({
            message: 'User successfully create ho gaya.',
            data: newUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Users ki list fetch karna
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Passwords hide karne ke liye
        res.status(200).json({ count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

//  ke dwara single User fetch karna
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User nahi mila.' });
        }
        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ message: 'Invalid ID ya server error', error: error.message });
    }
};

// 4. User Details Update karna
const updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // updated data return karega aur schema validation check karega
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User nahi mila.' });
        }

        res.status(200).json({
            message: 'User details update ho gayi hain.',
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Update fail ho gaya', error: error.message });
    }
};

// 5. User Delete karna
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User nahi mila.' });
        }
        res.status(200).json({ message: 'User successfully delete ho gaya.' });
    } catch (error) {
        res.status(500).json({ message: 'Delete fail ho gaya', error: error.message });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};