const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Token = require("./token.model");

const userSchema = new mongoose.Schema(
	{
		authType: {
			type: String,
			default: "plain",
			enum: ["plain", "google"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
		},
		isEmailVerified: {
			type: Boolean,
			default: function () {
				return this.authType === "google";
			},
		},
		password: {
			type: String,
			required: [
				function () {
					return this.authType === "plain";
				},
				"Password is required",
			],
			minlength: [6, "Password must be atleast 6 characters long"],
		},

		admin: {
			type: Boolean,
			default: false,
		},

		name: {
			type: String,
			required: [true, "Name is required"],
		},
		credits: {
			type: Number,
			default: 0,
		},
		verificationCode: {
			type: Number,
		},
		reports: {
			type: Number,
			default: 0,
		},
		blacklisted: {
			type: Boolean,
			default: false,
		},
		dob: {
			type: Date,
		},
		gender: {
			type: String,
			enum: ["Male", "Female", "Transgender", "Other"],
		},
		occupation: {
			type: String,
			enum: [
				"Student",
				"Government Employee",
				"Private Sector Employee",
				"Freelancer",
				"Business Owner",
				"Artist",
				"Medical Professional",
				"Lawyer",
				"Educator",
				"Other",
			],
		},
		location: {
			longitude: {
				type: Number,
			},
			latitude: {
				type: Number,
			},
		},
	},
	{ timestamps: true }
);

userSchema.methods.createAccessToken = function () {
	try {
		const { ACCESS_TOKEN_SECRET } = process.env;
		const user = this.toObject();
		delete user.password;
		return jwt.sign({ user }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
	} catch (error) {
		console.error("Error in access token generation\n", error);
	}
};

userSchema.methods.createRefreshToken = async function () {
	try {
		const { REFRESH_TOKEN_SECRET } = process.env;
		const token = jwt.sign({ _id: this._id }, REFRESH_TOKEN_SECRET, {
			expiresIn: "365d",
		});
		await Token.create({ token });
		return token;
	} catch (error) {
		console.error("Error in refresh token generation\n", error);
	}
};

userSchema.pre("save", async function (next) {
	try {
		if (
			(this.isNew || this.isModified("password")) &&
			this.authType === "plain"
		) {
			const salt = await bcrypt.genSalt(12);
			this.password = await bcrypt.hash(this.password, salt);
		}

		return next();
	} catch (error) {
		console.error("Error in password hashing\n", error);
	}
});

userSchema.post("findOneAndUpdate", async function (doc) {
	try {
		if (doc.reports >= parseInt(process.env.MAX_REPORTS)) {
			doc.blacklisted = true;
			await doc.save();
		}
	} catch (error) {
		console.error("Error in blacklisting\n", error);
	}
});

module.exports = mongoose.model("User", userSchema);
