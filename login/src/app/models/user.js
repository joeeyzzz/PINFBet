const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    local: {
        email: String,
        password: String
    },
    google: {
        email: String,
        password: String,
        id: String,
        token: String
    }
});

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validatePass = function (password) {
    return bcrypt.compareSync(password, this.local.password);
}

module.exports = mongoose.model("User", userSchema);