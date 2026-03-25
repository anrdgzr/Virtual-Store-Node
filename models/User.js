import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        // required: true 
    },
    role: { 
        type: String, 
        enum: ["admin", "user"], 
        default: "user" 
    },
    googleId: { 
        type: String 
    },
    favorites: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product"
    }]
}, { timestamps: true }
);

export default mongoose.model("User", userSchema);
