# couponhub-backend

REST APIs for CouponHub - Node.js,Express,MongoDB

**Use mongoose@15.11.15. Minor bug reported in later versions.**

Required env variables:

- `DB_URI`
- `PORT`
- `JWT_PRIVATE_KEY`
- `EMAIL`
- `EMAIL_PASSWORD`

**Implemented Features** :

- User signup/login
- Email Verification
- View/Delete user profile
- List coupons
- Create Coupon (Email must be verified)
- Buy Coupon (Email must be verified)

**TODO**

- include email templates
- implement google auth
- impelement reporting user for posting fake/used coupon
