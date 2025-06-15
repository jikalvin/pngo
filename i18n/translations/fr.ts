// i18n/translations/fr.ts
export default {
  common: {
    back: "fr:Back",
    continue: "fr:Continue",
    error: "fr:Error",
    needHelp: "fr:Need help? Contact Support",
    languageEnglish: "fr:ENGLISH", // Assuming this is for a language switcher
    email: "fr:Email",
    password: "fr:Password",
    done: "fr:Done", // From previous common keys
    welcome: "fr:Welcome", // From previous common keys
    success: "fr:Success", // Added
    notAvailable: "fr:N/A", // Added (if not already in profile)
  },
  onboarding: {
    selectUserType: "fr:Select User Type", // From previous onboarding keys
    customer: "fr:Customer", // From previous onboarding keys
    driver: "fr:Driver", // From previous onboarding keys
    customerDescription: "fr:I want to send packages", // From previous onboarding keys
    driverDescription: "fr:I want to deliver packages", // From previous onboarding keys
    userTypePrompt: "fr:How would you like to use the app?",
    continueAsUser: "fr:Continue as User",
    userDescription: "fr:I want to send or receive packages",
    continueAsPicker: "fr:Continue as Picker",
    pickerDescription: "fr:I want to deliver packages and earn",
  },
  auth: {
    signIn: "fr:Sign In", // Combined from common.signIn and auth.signInButton
    signUp: "fr:Sign Up", // Combined from common.signUp and auth.signUpButton
    signInTitle: "fr:Sign in to your account",
    signUpTitle: "fr:Create your account",
    forgotPassword: "fr:Forgot Password?", // From previous auth keys
    noAccount: "fr:Need an account?", // Combined from previous noAccount and toggleToSignUp
    hasAccount: "fr:Already have an account?", // Combined from previous hasAccount and toggleToSignIn
    enterPhoneNumber: "fr:Enter your phone number", // From previous auth keys (though phone auth removed)
    useEmail: "fr:Use Email instead", // From previous auth keys (though phone auth removed)
    verifyPhoneNumber: "fr:Verify Phone Number", // From previous auth keys (though phone auth removed)
    enterVerificationCode: "fr:Enter the verification code sent to", // From previous auth keys (though phone auth removed)
    emailPlaceholder: "fr:Email",
    passwordPlaceholder: "fr:Password",
    // Buttons are covered by common.signIn/signUp or auth.signIn/signUp
    // toggleToSignIn: "fr:Already have an account? Sign In", // Covered by auth.hasAccount + common.signIn
    // toggleToSignUp: "fr:Need an account? Sign Up", // Covered by auth.noAccount + common.signUp
    alertSignUpSuccessTitle: "fr:Sign Up Successful",
    alertSignUpSuccessMessage: "fr:Your account has been created.",
    alertSignInSuccessTitle: "fr:Sign In Successful",
    alertSignInSuccessMessage: "fr:Welcome back!",
    alertAuthErrorTitle: "fr:Authentication Error",
    alertValidationEmailPassword: "fr:Please enter both email and password.",
    alertUserRoleMissing: "fr:User role not specified. Cannot complete registration.",
  },
  // Placeholder for profile if needed in future, from previous tasks
  profile: {
    title: "fr:Profile",
    notAvailable: "fr:N/A", // Added
    personalDetailsTitle: "fr:Personal Details",
    personalDetailsDescription: "fr:Name, phone number, address, email",
    accountSettingsTitle: "fr:Account Settings",
    accountSettingsDescription: "fr:Password, payment and security",
    kycVerificationTitle: "fr:KYC & Verification",
    kycVerificationDescriptionPrefix: "fr:Verification Status:",
    kycVerificationStatusVerified: "fr:Verified",
    appPreferencesTitle: "fr:App Preferences",
    appPreferencesDescription: "fr:Language and Theme",
    availabilityTitle: "fr:Availability",
    availabilityDescription: "fr:Schedule, Unavailable",
    deliveryHistoryTitle: "fr:Delivery History",
    deliveryHistoryDescription: "fr:View completed, ongoing, and cancelled tasks",
    favouritesTitle: "fr:Favourites",
    favouritesDescription: "fr:Favorite Pickers for quick access",
    // defaultNamePlaceholder: "fr:User Name", // From previous plan, if used
    // defaultDescriptionPlaceholder: "fr:No description yet.", // From previous plan, if used
  },
  myPackages: {
    title: "fr:My Packages",
    emptyStateText: "fr:No packages yet",
    emptyStateSubtext: "fr:Your packages will appear here"
  },
  search: {
    title: "fr:Available Tasks",
    emptyStateText: "fr:No open tasks available at the moment."
  },
  packageCard: {
    fromPrefix: "fr:From: ",
    toPrefix: "fr:To: ",
    createdPrefix: "fr:Created: "
  },
  statusBadge: {
    pending: "fr:Pending",
    in_transit: "fr:In Transit",
    delivered: "fr:Delivered",
    cancelled: "fr:Cancelled",
    open: "fr:Open",
    assigned: "fr:Assigned"
    // Add other statuses as they appear
  },
  createTask: {
    headerTitle: "fr:Create Delivery",
    step1Header: "fr:Package Info",
    step2Header: "fr:Delivery Details",
    step3Header: "fr:Summary",
    uploadVideoHint: "fr:Upload a video (1min max)",
    uploadImagesHint: "fr:Upload up to 4 images",
    deliveryNameLabel: "fr:Delivery name",
    deliveryNamePlaceholder: "fr:Enter delivery name",
    sizeEstimateLabel: "fr:Size estimate",
    sizeEstimatePlaceholder: "fr:Size & Moto",
    weightLabel: "fr:Weight",
    weightPlaceholder: "fr:Enter weight in kg",
    typePriorityLabel: "fr:Type & Priority",
    typeDefault: "fr:Standard",
    priorityDefault: "fr:Standard",
    cancelButton: "fr:Cancel",
    dateLabel: "fr:Date",
    datePlaceholder: "fr:Select date",
    timeLabel: "fr:Time",
    timePlaceholder: "fr:Select delivery time",
    pickingAddressLabel: "fr:Picking Address",
    pickingAddressPlaceholder: "fr:Enter Picking Address",
    droppingAddressLabel: "fr:Dropping Address",
    droppingAddressPlaceholder: "fr:Enter Dropping Address",
    priceRangeLabel: "fr:Price Range",
    minAmountPlaceholder: "fr:Min amount",
    maxAmountPlaceholder: "fr:Max amount",
    paymentMethodsLabel: "fr:Accepted Payment Methods",
    paymentMethodsPlaceholder: "fr:Select payment methods",
    summaryDeliveryTitleLabel: "fr:Delivery Title",
    summarySizeLabel: "fr:Size",
    summaryWeightLabel: "fr:Weight",
    summaryKgSuffix: "fr:kg",
    summaryPriorityLabel: "fr:Priority",
    summaryTypeLabel: "fr:Type",
    summaryPriceLabel: "fr:Price",
    summaryAddressJoiner: "fr:to",
    summaryPickupDateLabel: "fr:Pickup Date",
    summaryAtConnector: "fr:at",
    summaryPaymentMethodsLabel: "fr:Payment Methods",
    summaryNoImage: "fr:No Image",
    createButton: "fr:Create",
    alertMissingLogin: "fr:You must be logged in to create a task.",
    alertCreateSuccessTitle: "fr:Success",
    alertCreateSuccessMessage: "fr:Task created successfully!",
    alertCreateErrorTitle: "fr:Error Creating Task",
    alertCreateErrorMessage: "fr:Failed to create task. Please try again."
  },
  packageDetails: {
    headerFallbackPrefix: "fr:Task #",
    errorTitle: "fr:Error",
    taskNotFound: "fr:Task Not Found",
    taskLoadError: "fr:Could not load task details.",
    sectionPackageDetails: "fr:Package Details",
    labelFrom: "fr:From",
    labelTo: "fr:To",
    labelDescription: "fr:Description",
    labelWeight: "fr:Weight",
    labelKgSuffix: "fr:kg",
    labelSize: "fr:Size",
    labelPriority: "fr:Priority",
    labelType: "fr:Type",
    labelPriceRange: "fr:Price Range",
    labelPaymentMethods: "fr:Payment Methods",
    labelCreatedAt: "fr:Created At",
    labelNotAvailable: "fr:N/A",
    sectionPlaceBid: "fr:Place Your Bid",
    bidAmountPlaceholder: "fr:Enter your bid amount",
    submitBidButton: "fr:Submit Bid",
    bidPlacedButton: "fr:Bid Placed",
    alertInvalidBidTitle: "fr:Invalid Bid",
    alertInvalidBidMessage: "fr:Please enter a valid bid amount.",
    alertUserOrTaskMissing: "fr:User or task details missing.",
    alertBidSuccessTitle: "fr:Success",
    alertBidSuccessMessage: "fr:Bid placed successfully!",
    alertBidErrorTitle: "fr:Error Placing Bid",
    alertBidErrorMessage: "fr:Failed to place bid. Please try again.",
    sectionBidsReceived: "fr:Bids Received",
    labelBidderNamePrefix: "fr:Picker ID: ",
    labelBidAmountPrefix: "fr:Amount: $",
    labelBidTimestampPrefix: "fr:Placed: ",
    acceptBidButton: "fr:Accept Bid",
    noActiveBids: "fr:No active bids yet for this task.",
    alertAcceptAuthError: "fr:You are not authorized to accept bids for this task.",
    alertAcceptSuccessTitle: "fr:Success",
    alertAcceptSuccessMessage: "fr:Bid accepted and task assigned!",
    alertAcceptErrorTitle: "fr:Error Accepting Bid",
    alertAcceptErrorMessage: "fr:Failed to accept bid. Please try again.",
    viewAssignedPickerButton: "fr:View Assigned Picker / All Bids",
    chatButton: "fr:Chat",
    trackButton: "fr:Track"
  }
};
