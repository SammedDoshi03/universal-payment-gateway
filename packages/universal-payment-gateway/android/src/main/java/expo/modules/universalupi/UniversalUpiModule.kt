package expo.modules.universalupi

import android.content.Intent
import android.net.Uri
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

class UniversalUpiModule : Module() {
  private var pendingPromise: Promise? = null
  private val UPI_REQUEST_CODE = 12345

  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('UniversalUpi')` in JavaScript.
    Name("UniversalUpi")

    AsyncFunction("initiatePayment") { uriString: String, promise: Promise ->
      val activity = appContext.activityProvider?.currentActivity
      if (activity == null) {
        promise.reject("ERR_NO_ACTIVITY", "Cannot find current Activity", null)
        return@AsyncFunction
      }

      try {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(uriString))
        val chooser = Intent.createChooser(intent, "Pay using...")
        pendingPromise = promise
        
        activity.startActivityForResult(chooser, UPI_REQUEST_CODE)
      } catch (e: Exception) {
        promise.reject("ERR_FAILED", "Failed to resolve UPI intent", e)
      }
    }

    OnActivityResult { _, payload ->
      if (payload.requestCode == UPI_REQUEST_CODE) {
        val data = payload.data?.getStringExtra("response") ?: payload.data?.dataString
        if (data != null) {
          pendingPromise?.resolve(data)
        } else {
          pendingPromise?.reject("ERR_USER_CANCELLED", "User cancelled or no response", null)
        }
        pendingPromise = null
      }
    }
  }
}
