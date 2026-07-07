package com.serenitydev.serenotes;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "MainActivity";
    private boolean backPressedOnce = false;
    private final Handler handler = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Log.d(TAG, "onCreate called");

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                Log.d(TAG, "handleOnBackPressed called");

                WebView webView = getBridge().getWebView();
                Log.d(TAG, "canGoBack: " + (webView != null && webView.canGoBack()));

                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                    return;
                }

                if (backPressedOnce) {
                    handler.removeCallbacksAndMessages(null);
                    Log.d(TAG, "Exiting app");
                    finish();
                    return;
                }

                backPressedOnce = true;
                Toast.makeText(MainActivity.this, "Press back again to exit", Toast.LENGTH_SHORT).show();
                handler.postDelayed(() -> backPressedOnce = false, 2000);
            }
        });
    }
}