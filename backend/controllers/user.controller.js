import User from "../models/user.model.js";

// export const getUsersForSidebar = async (req, res) => {
//     try {
//         const loggedInUserId = req.user._id;
//         const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
//         res.status(200).json(filteredUsers);
//     } catch (error) { res.status(500).json({ error: "Internal server error" }); }
// };

export const toggleArchiveUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id: targetId } = req.params;

        const user = await User.findById(userId);
        const isArchived = user.archivedUsers.includes(targetId);

        if (isArchived) {
            user.archivedUsers = user.archivedUsers.filter(id => id.toString() !== targetId);
        } else {
            user.archivedUsers.push(targetId);
        }

        await user.save();
        res.status(200).json(user.archivedUsers);
    } catch (error) { res.status(500).json({ error: "Internal server error" }); }
};

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        // Fetch current user to know archived list
        const currentUser = await User.findById(loggedInUserId);
        
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        
        // Append archive status to response
        const usersWithStatus = filteredUsers.map(user => ({
            ...user.toObject(),
            isArchived: currentUser.archivedUsers.includes(user._id)
        }));

        res.status(200).json(usersWithStatus);
    } catch (error) { res.status(500).json({ error: "Internal server error" }); }
};