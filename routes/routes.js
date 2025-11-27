const express = require('express');
const router = express.Router();
const controller = require("../controller/controller");
const { requireAuth } = require('../middleware/authMiddleware');

// Public routes
router.get('/', (req, res) => {
    res.render('auth');
});

router.get('/register', (req, res) => {
    res.render('register');
});

// Authentication routes
router.post('/create-user', controller.createUser);
router.post('/login', controller.login);
router.get('/logout', controller.logout);

// SMS sending endpoint (receives requests from frontend and relays to external SMS API)
router.post('/send-sms', requireAuth, controller.sendSms);
// SMS history endpoint
router.get('/sms-history', requireAuth, controller.getSmsHistory);

// Admin routes
router.get('/Index', requireAuth, (req, res) => {
    res.render('admin/admin_index-1');
});

router.get('/superadmin', requireAuth, (req, res) => {
    res.render('admin/admin_super_admin');
});

router.get('/Admin', requireAuth, (req, res) => {
    res.render('admin/admin_super_admin');
});

router.get('/Map', (req, res) => {
    res.render('admin/pwd_map');
});

router.get('/Maps', (req, res) => {
    res.render('admin/senior_map');
});


router.get('/Analytics', requireAuth, (req, res) => {
    res.render('admin/admin_analytics');
});


router.get('/User', requireAuth, (req, res) => {
    res.render('admin/admin_update');
});


router.get('/index-youth', requireAuth,controller.renderYouth);

router.get('/add_youth', requireAuth,(req, res) => {
    res.render('youth/staff_youth_add');
});

router.get('/Youth',(req, res) => {
    res.render('youth/admin_youth');
});

router.get('/Mapss', (req, res) => {
    res.render('youth/youth_map');
});

router.post('/create-youth', controller.createYouth);
router.put('/update-youth', controller.updateYouth);


// Staff routes
router.get('/index-staff', requireAuth, (req, res) => {
    res.render('staff/staff_dashboard');
});



router.post('/register-pwd', controller.registerPwd);
router.post('/update-pwd', requireAuth, controller.updatePwd);
router.post('/archive-pwd', requireAuth, controller.archivePwd);
router.post('/unarchive-pwd', requireAuth, controller.unarchivePwd);
router.post('/update-senior', requireAuth, controller.updateSenior);
router.post('/archive-senior', requireAuth, controller.archiveSenior);
router.post('/unarchive-senior', requireAuth, controller.unarchiveSenior);
router.post('/archive-youth', requireAuth, controller.archiveYouth);
router.post('/unarchive-youth', requireAuth, controller.unarchiveYouth);

router.get('/add_senior', controller.renderAddSenior);

router.get('/add_pwd', controller.renderAddPWD);



//Super admin 
router.get('/index-superadmin',controller.renderSuperAdminIndex);

router.get('/superadmin-users',controller.renderSuperAdminUser);

router.post('/update-user', requireAuth, controller.updateUser);
router.post('/edit-user', requireAuth, controller.editUserStatus);

// Form routes (used by both staff and admin)
router.get('/Senior-form', requireAuth, controller.renderSeniorForm);

router.get('/Pwd-form', requireAuth, controller.renderPWDForm);
router.get('/pwd/:id/application-pdf', requireAuth, controller.generatePwdApplicationPdf);

//Youth routes
router.get('', requireAuth, (req, res) => {
    res.render(youth/staff_youth);
});

router.get('/youth-form', controller.renderYouthForm);

router.post('/add-youth', requireAuth,controller.createYouth);


// Data operations
router.post('/add-data', controller.createResident);

// Analytics APIs
router.get('/api/analytics/osca', requireAuth, controller.getOscaAnalytics);
router.get('/api/analytics/pdao', requireAuth, controller.getPdaoAnalytics);
router.get('/api/analytics/youth', controller.getYouthAnalytics);
router.get('/api/pwds', requireAuth, controller.getAllPwds);
router.get('/api/senior-citizens-for-report', requireAuth, controller.getSeniorCitizensForReport);


//ArcGIS routes
router.get("/silay-boundary", controller.getSilayBoundary);
router.get("/villages", controller.getVillages);
router.get("/senior-map-data", controller.getSeniorMapData);
router.get("/pwd-map-data", controller.getPwdMapData);
router.get("/youth-map-data", controller.getYouthMapData);
router.get("/debug-senior-data", controller.debugSeniorData);

module.exports = router;