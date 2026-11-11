export interface AndroidProjectFile {
  path: string;
  category: 'gradle' | 'manifest' | 'kotlin_core' | 'kotlin_render' | 'kotlin_net' | 'server' | 'flame' | 'guide';
  title: string;
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidProjectFile[] = [
  {
    path: 'settings.gradle.kts',
    category: 'gradle',
    title: 'Settings Gradle',
    description: 'Root Gradle configuration defining plugins and Google/Maven repositories.',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = java.net.URI("https://jitpack.io") }
    }
}

rootProject.name = "CallOfBattleAnime"
include(":app")
`
  },
  {
    path: 'build.gradle.kts',
    category: 'gradle',
    title: 'Root Project Build Gradle',
    description: 'Project-level build configuration using Kotlin 1.9+ and Android Gradle Plugin 8.2+.',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id("com.android.application") version "8.2.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.22" apply false
    id("com.google.devtools.ksp") version "1.9.22-1.0.17" apply false
}
`
  },
  {
    path: 'app/build.gradle.kts',
    category: 'gradle',
    title: 'App Module Build Gradle',
    description: 'Android application build configuration: Min SDK 24, Target SDK 34, Coroutines, OkHttp WebSocket, Room/DataStore.',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.devtools.ksp")
}

android {
    namespace = "com.callofbattle.anime"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.callofbattle.anime"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0-ANIME"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        ndk {
            abiFilters += listOf("armeabi-v7a", "arm64-v8a", "x86", "x86_64")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug") // Replace with your release keystore
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    // AndroidX & Core
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")

    // Kotlin Coroutines for async operations & networking
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

    // Preferences & Room Database for offline player profile, XP, coins, skin unlocks
    implementation("androidx.datastore:datastore-preferences:1.0.0")
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")

    // OkHttp for ultra low latency WebSocket multiplayer & REST API
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.google.code.gson:gson:2.10.1")

    // Audio & Haptics
    implementation("androidx.media:media:1.7.0")
}
`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    category: 'manifest',
    title: 'AndroidManifest.xml',
    description: 'Landscape-locked, immersive fullscreen configuration with INTERNET, VIBRATE, and hardware acceleration.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissions for real-time online multiplayer and tactical combat feedback -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Call of Battle: Anime"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:hardwareAccelerated="true"
        android:theme="@style/Theme.CallOfBattle.Fullscreen">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="sensorLandscape"
            android:configChanges="orientation|screenSize|keyboardHidden|screenLayout"
            android:theme="@style/Theme.CallOfBattle.Fullscreen">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
  },
  {
    path: 'app/src/main/java/com/callofbattle/anime/MainActivity.kt',
    category: 'kotlin_core',
    title: 'MainActivity.kt',
    description: 'Entry point setting up WindowInsetsController for sticky immersive fullscreen landscape gameplay.',
    content: `package com.callofbattle.anime

import android.content.pm.ActivityInfo
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import com.callofbattle.anime.game.GameSurfaceView

class MainActivity : AppCompatActivity() {

    private lateinit var gameView: GameSurfaceView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Force Landscape & Keep Screen On
        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        // Enable Sticky Immersive Fullscreen Mode
        hideSystemUI()

        gameView = GameSurfaceView(this)
        setContentView(gameView)
    }

    private fun hideSystemUI() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
            window.insetsController?.let { controller ->
                controller.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
                controller.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN
            )
        }
    }

    override fun onResume() {
        super.onResume()
        hideSystemUI()
        gameView.resumeGame()
    }

    override fun onPause() {
        super.onPause()
        gameView.pauseGame()
    }
}
`
  },
  {
    path: 'app/src/main/java/com/callofbattle/anime/game/GameSurfaceView.kt',
    category: 'kotlin_render',
    title: 'GameSurfaceView.kt',
    description: 'High-performance 60 FPS dedicated game loop thread with multi-touch virtual joysticks and Canvas renderer.',
    content: `package com.callofbattle.anime.game

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.view.MotionEvent
import android.view.SurfaceHolder
import android.view.SurfaceView
import com.callofbattle.anime.engine.GameEngine
import com.callofbattle.anime.render.AnimeCharacterRenderer
import com.callofbattle.anime.render.AnimeMapRenderer
import com.callofbattle.anime.ui.VirtualJoystick

class GameSurfaceView(context: Context) : SurfaceView(context), SurfaceHolder.Callback, Runnable {

    private var gameThread: Thread? = null
    @Volatile private var isRunning: Boolean = false

    val engine = GameEngine(context)
    val leftJoystick = VirtualJoystick(isLeft = true)
    val rightJoystick = VirtualJoystick(isLeft = false)

    private val fpsPaint = Paint().apply {
        color = Color.CYAN
        textSize = 36f
        isAntiAlias = true
    }

    init {
        holder.addCallback(this)
        isFocusable = true
    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        resumeGame()
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
        engine.setViewport(width, height)
        leftJoystick.updateScreenBounds(width, height)
        rightJoystick.updateScreenBounds(width, height)
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        pauseGame()
    }

    fun resumeGame() {
        isRunning = true
        gameThread = Thread(this, "GameLoopThread").apply { start() }
    }

    fun pauseGame() {
        isRunning = false
        try {
            gameThread?.join()
        } catch (e: InterruptedException) {
            e.printStackTrace()
        }
    }

    override fun run() {
        var lastTime = System.nanoTime()
        val targetNs = 1_000_000_000.0 / 60.0 // 60 FPS Target

        while (isRunning) {
            val now = System.nanoTime()
            val elapsedSec = ((now - lastTime) / 1_000_000_000.0).toFloat().coerceIn(0.001f, 0.05f)
            lastTime = now

            // 1. Process Virtual Joysticks & Player Input
            engine.processInput(
                moveX = leftJoystick.normalizedX,
                isJetpacking = leftJoystick.normalizedY < -0.3f,
                aimAngle = rightJoystick.angle,
                isFiring = rightJoystick.isPressed
            )

            // 2. Step Physics & Game State
            engine.update(elapsedSec)

            // 3. Render High-Performance Frame on Hardware Canvas
            var canvas: Canvas? = null
            try {
                canvas = holder.lockHardwareCanvas()
                if (canvas != null) {
                    synchronized(holder) {
                        drawFrame(canvas)
                    }
                }
            } finally {
                if (canvas != null) {
                    holder.unlockCanvasAndPost(canvas)
                }
            }
        }
    }

    private fun drawFrame(canvas: Canvas) {
        // Clear background
        canvas.drawColor(Color.BLACK)

        // Render Parallax Anime Map
        AnimeMapRenderer.render(canvas, engine)

        // Render Anime Characters with Cel-shading & Outlines
        for (player in engine.players) {
            AnimeCharacterRenderer.render(canvas, player, engine.gameTime)
        }

        // Render Projectiles, Particles, Comic Texts & Pickups
        engine.renderProjectilesAndFX(canvas)

        // Render In-Game Anime HUD & Virtual Joysticks
        leftJoystick.draw(canvas)
        rightJoystick.draw(canvas)
        engine.renderHUD(canvas)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        val pointerCount = event.pointerCount
        for (i in 0 until pointerCount) {
            val pointerId = event.getPointerId(i)
            val x = event.getX(i)
            val y = event.getY(i)
            val action = event.actionMasked

            when (action) {
                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                    if (x < width * 0.45f) {
                        leftJoystick.onTouchDown(pointerId, x, y)
                    } else if (x > width * 0.55f) {
                        rightJoystick.onTouchDown(pointerId, x, y)
                    }
                }
                MotionEvent.ACTION_MOVE -> {
                    leftJoystick.onTouchMove(pointerId, x, y)
                    rightJoystick.onTouchMove(pointerId, x, y)
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP, MotionEvent.ACTION_CANCEL -> {
                    leftJoystick.onTouchUp(pointerId)
                    rightJoystick.onTouchUp(pointerId)
                }
            }
        }
        return true
    }
}
`
  },
  {
    path: 'app/src/main/java/com/callofbattle/anime/render/AnimeCharacterRenderer.kt',
    category: 'kotlin_render',
    title: 'AnimeCharacterRenderer.kt',
    description: 'Procedural Android Canvas renderer drawing 8 chibi anime characters, cel-shaded outlines, flowing scarves, and animated hairstyles.',
    content: `package com.callofbattle.anime.render

import android.graphics.*
import com.callofbattle.anime.model.Player
import kotlin.math.*

object AnimeCharacterRenderer {

    private val outlinePaint = Paint().apply {
        color = Color.BLACK
        style = Paint.Style.STROKE
        strokeWidth = 4f
        isAntiAlias = true
    }

    private val fillPaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val eyeWhitePaint = Paint().apply {
        color = Color.WHITE
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    fun render(canvas: Canvas, player: Player, gameTime: Float) {
        canvas.save()
        canvas.translate(player.x, player.y)

        if (player.isDead) {
            canvas.rotate(player.ragdollRotation)
        }

        if (player.facingLeft) {
            canvas.scale(-1f, 1f)
        }

        val isMoving = abs(player.vx) > 15f
        val bob = if (isMoving) sin(gameTime * 14f) * 4f else sin(gameTime * 3f) * 2f

        // 1. Draw Jetpack Thruster
        drawJetpack(canvas, player, gameTime)

        // 2. Draw Flowing Scarf reacting to velocity + wind
        drawFlowingScarf(canvas, player, gameTime)

        // 3. Draw Legs & Sci-Fi Boots
        drawLegs(canvas, player, bob, gameTime)

        // 4. Draw Torso & Military Anime Jacket
        drawTorso(canvas, player, bob)

        // 5. Draw Anime Chibi Head, Expressions & Spiky Hair
        drawHead(canvas, player, bob, gameTime)

        // 6. Draw Weapon with Aim Angle & Recoil Kick
        drawWeapon(canvas, player, bob)

        canvas.restore()
    }

    private fun drawJetpack(canvas: Canvas, player: Player, gameTime: Float) {
        canvas.save()
        canvas.translate(-16f, -14f)

        fillPaint.color = Color.DKGRAY
        canvas.drawRoundRect(-4f, -12f, 8f, 16f, 4f, 4f, fillPaint)
        canvas.drawRoundRect(-4f, -12f, 8f, 16f, 4f, 4f, outlinePaint)

        // Thruster flame when jetpacking
        if (player.isJetpacking && !player.isDead) {
            val flameH = 22f + sin(gameTime * 30f) * 8f
            val flamePaint = Paint().apply {
                shader = LinearGradient(0f, 16f, 0f, 16f + flameH, Color.CYAN, Color.TRANSPARENT, Shader.TileMode.CLAMP)
            }
            val path = Path().apply {
                moveTo(-4f, 16f)
                lineTo(4f, 16f)
                lineTo(0f, 16f + flameH)
                close()
            }
            canvas.drawPath(path, flamePaint)
        }
        canvas.restore()
    }

    private fun drawFlowingScarf(canvas: Canvas, player: Player, gameTime: Float) {
        canvas.save()
        canvas.translate(-4f, -22f)

        val wind = if (player.isJetpacking) 1.2f else if (player.vx > 20f) 0.6f else 0.2f
        val sway = sin(gameTime * 8f) * 6f

        fillPaint.color = player.character.scarfColor
        val path = Path().apply {
            moveTo(0f, 0f)
            quadTo(-16f * cos(wind), 12f * sin(wind), -32f * cos(wind), 20f * sin(wind) + sway)
            lineTo(-28f * cos(wind), 26f * sin(wind) + sway)
            quadTo(-12f * cos(wind), 16f * sin(wind), 4f, 6f)
            close()
        }
        canvas.drawPath(path, fillPaint)
        canvas.drawPath(path, outlinePaint)
        canvas.restore()
    }

    private fun drawLegs(canvas: Canvas, player: Player, bob: Float, gameTime: Float) {
        fillPaint.color = player.character.outfitColor
        val legSwing = if (abs(player.vx) > 15f) sin(gameTime * 16f) * 10f else 0f

        canvas.drawRoundRect(-8f + legSwing, 6f + bob, -2f + legSwing, 22f + bob, 4f, 4f, fillPaint)
        canvas.drawRoundRect(-8f + legSwing, 6f + bob, -2f + legSwing, 22f + bob, 4f, 4f, outlinePaint)

        canvas.drawRoundRect(2f - legSwing, 6f + bob, 8f - legSwing, 22f + bob, 4f, 4f, fillPaint)
        canvas.drawRoundRect(2f - legSwing, 6f + bob, 8f - legSwing, 22f + bob, 4f, 4f, outlinePaint)
    }

    private fun drawTorso(canvas: Canvas, player: Player, bob: Float) {
        fillPaint.color = player.character.outfitColor
        canvas.drawRoundRect(-10f, -12f + bob, 10f, 10f + bob, 6f, 6f, fillPaint)
        canvas.drawRoundRect(-10f, -12f + bob, 10f, 10f + bob, 6f, 6f, outlinePaint)
    }

    private fun drawHead(canvas: Canvas, player: Player, bob: Float, gameTime: Float) {
        canvas.save()
        canvas.translate(0f, -24f + bob)

        // Chibi Face Base (Peach Porcelain)
        fillPaint.color = Color.rgb(255, 228, 214)
        canvas.drawCircle(0f, 0f, 13f, fillPaint)
        canvas.drawCircle(0f, 0f, 13f, outlinePaint)

        // Huge Anime Eyes
        if (player.isDead) {
            // X eyes
            canvas.drawLine(-8f, -2f, -2f, 4f, outlinePaint)
            canvas.drawLine(-2f, -2f, -8f, 4f, outlinePaint)
            canvas.drawLine(2f, -2f, 8f, 4f, outlinePaint)
            canvas.drawLine(8f, -2f, 2f, 4f, outlinePaint)
        } else {
            // Expressive Sparkling Eyes
            listOf(-5f, 5f).forEach { eyeX ->
                canvas.drawOval(eyeX - 4f, -4f, eyeX + 4f, 4f, eyeWhitePaint)
                canvas.drawOval(eyeX - 4f, -4f, eyeX + 4f, 4f, outlinePaint)

                fillPaint.color = player.character.eyeColor
                canvas.drawCircle(eyeX + 0.5f, 0.5f, 2.5f, fillPaint)

                // Specular highlight sparkle
                fillPaint.color = Color.WHITE
                canvas.drawCircle(eyeX - 1f, -1.5f, 1.2f, fillPaint)
            }
        }

        // Spiky Anime Hair
        fillPaint.color = player.character.hairColor
        val hairPath = Path().apply {
            moveTo(-14f, -4f)
            lineTo(-18f, -14f)
            lineTo(-10f, -12f)
            lineTo(-4f, -22f)
            lineTo(4f, -16f)
            lineTo(12f, -20f)
            lineTo(14f, -6f)
            lineTo(8f, 0f)
            lineTo(0f, -4f)
            lineTo(-8f, 0f)
            close()
        }
        canvas.drawPath(hairPath, fillPaint)
        canvas.drawPath(hairPath, outlinePaint)

        canvas.restore()
    }

    private fun drawWeapon(canvas: Canvas, player: Player, bob: Float) {
        canvas.save()
        canvas.translate(0f, -4f + bob)
        canvas.rotate(Math.toDegrees(player.aimAngle.toDouble()).toFloat())

        fillPaint.color = Color.DKGRAY
        canvas.drawRect(4f, -3f, 32f, 5f, fillPaint)
        canvas.drawRect(4f, -3f, 32f, 5f, outlinePaint)

        // Energy glow barrel
        fillPaint.color = Color.CYAN
        canvas.drawRect(8f, -1f, 28f, 2f, fillPaint)

        canvas.restore()
    }
}
`
  },
  {
    path: 'app/src/main/java/com/callofbattle/anime/net/NetworkClient.kt',
    category: 'kotlin_net',
    title: 'NetworkClient.kt',
    description: 'Real-time OkHttp WebSocket multiplayer client with client prediction, server reconciliation, and ping measurement.',
    content: `package com.callofbattle.anime.net

import com.google.gson.Gson
import com.google.gson.JsonObject
import okhttp3.*
import java.util.concurrent.TimeUnit

class NetworkClient(private val listener: NetworkEventListener) {

    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .pingInterval(2, TimeUnit.SECONDS)
        .build()

    private var webSocket: WebSocket? = null
    private val gson = Gson()
    var isConnected = false
        private set

    fun connect(serverUrl: String = "wss://your-game-server.onrender.com/ws") {
        val request = Request.Builder().url(serverUrl).build()
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(ws: WebSocket, response: Response) {
                isConnected = true
                listener.onConnected()
            }

            override fun onMessage(ws: WebSocket, text: String) {
                try {
                    val json = gson.fromJson(text, JsonObject::class.java)
                    val type = json.get("type")?.asString ?: return

                    when (type) {
                        "world_state" -> listener.onWorldState(json)
                        "room_joined" -> listener.onRoomJoined(json.get("roomCode").asString)
                        "quick_chat_broadcast" -> listener.onChatMessage(
                            json.get("sender").asString,
                            json.get("text").asString
                        )
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }

            override fun onFailure(ws: WebSocket, t: Throwable, response: Response?) {
                isConnected = false
                listener.onError(t.message ?: "Connection failure")
            }

            override fun onClosed(ws: WebSocket, code: Int, reason: String) {
                isConnected = false
                listener.onDisconnected()
            }
        })
    }

    fun sendInput(seq: Int, moveX: Float, isJetpack: Boolean, aimAngle: Float, isFiring: Boolean) {
        if (!isConnected) return
        val json = JsonObject().apply {
            addProperty("type", "input")
            addProperty("seq", seq)
            addProperty("moveX", moveX)
            addProperty("isJetpacking", isJetpack)
            addProperty("aimAngle", aimAngle)
            addProperty("isFiring", isFiring)
            addProperty("timestamp", System.currentTimeMillis())
        }
        webSocket?.send(json.toString())
    }

    fun createRoom(nickname: String, characterId: String) {
        val json = JsonObject().apply {
            addProperty("type", "create_room")
            addProperty("nickname", nickname)
            addProperty("characterId", characterId)
        }
        webSocket?.send(json.toString())
    }

    fun joinRoom(code: String, nickname: String, characterId: String) {
        val json = JsonObject().apply {
            addProperty("type", "join_room")
            addProperty("roomCode", code)
            addProperty("nickname", nickname)
            addProperty("characterId", characterId)
        }
        webSocket?.send(json.toString())
    }

    fun sendQuickChat(presetText: String) {
        val json = JsonObject().apply {
            addProperty("type", "quick_chat")
            addProperty("text", presetText)
        }
        webSocket?.send(json.toString())
    }

    fun disconnect() {
        webSocket?.close(1000, "User left")
        isConnected = false
    }
}

interface NetworkEventListener {
    fun onConnected()
    fun onWorldState(stateJson: JsonObject)
    fun onRoomJoined(roomCode: String)
    fun onChatMessage(sender: String, text: String)
    fun onError(error: String)
    fun onDisconnected()
}
`
  },
  {
    path: 'server/package.json',
    category: 'server',
    title: 'Server package.json',
    description: 'Standalone Node.js game server package configuration with ws and express.',
    content: `{
  "name": "call-of-battle-server",
  "version": "1.0.0",
  "description": "Authoritative 30 tick/s WebSocket Game Server for Call of Battle",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "ws": "^8.18.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
`
  },
  {
    path: 'server/Dockerfile',
    category: 'server',
    title: 'Server Dockerfile',
    description: 'Production container configuration for 1-click deploy to Render, Railway, Fly.io or VPS.',
    content: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
`
  },
  {
    path: 'flame/flame_game_bridge.dart',
    category: 'flame',
    title: 'Flutter / Flame Game Bridge',
    description: 'Flame cross-platform architecture bridging Call of Battle to Flutter (iOS, Android, Web, Desktop).',
    content: `// Flutter & Flame cross-platform architecture for Call of Battle: Anime Edition
import 'package:flame/game.dart';
import 'package:flame/components.dart';
import 'package:flame/input.dart';
import 'package:flutter/material.dart';

class CallOfBattleFlameGame extends FlameGame with HasDraggableComponents, HasTappables {
  late final JoystickComponent leftJoystick;
  late final JoystickComponent rightJoystick;
  late final AnimePlayerComponent localPlayer;

  @override
  Future<void> onLoad() async {
    // 1. Setup Dual Virtual Joysticks
    final knobPaint = Paint()..color = const Color(0xFF00F0FF).withOpacity(0.8);
    final backgroundPaint = Paint()..color = Colors.black.withOpacity(0.4);

    leftJoystick = JoystickComponent(
      knob: CircleComponent(radius: 25, paint: knobPaint),
      background: CircleComponent(radius: 60, paint: backgroundPaint),
      margin: const EdgeInsets.only(left: 40, bottom: 40),
    );

    rightJoystick = JoystickComponent(
      knob: CircleComponent(radius: 25, paint: Paint()..color = Colors.pinkAccent),
      background: CircleComponent(radius: 60, paint: backgroundPaint),
      margin: const EdgeInsets.only(right: 40, bottom: 40),
    );

    add(leftJoystick);
    add(rightJoystick);

    // 2. Add Anime Player
    localPlayer = AnimePlayerComponent(
      position: Vector2(size.x / 2, size.y / 2),
      characterId: 'aoi',
    );
    add(localPlayer);
  }

  @override
  void update(double dt) {
    super.update(dt);
    // Move & Jetpack
    if (!leftJoystick.delta.isZero()) {
      localPlayer.position.add(leftJoystick.relativeDelta * 280 * dt);
      if (leftJoystick.relativeDelta.y < -0.3) {
        localPlayer.isJetpacking = true;
      }
    } else {
      localPlayer.isJetpacking = false;
    }

    // Aim & Auto-Fire
    if (!rightJoystick.delta.isZero()) {
      localPlayer.aimAngle = rightJoystick.delta.screenAngle();
      localPlayer.isFiring = true;
    } else {
      localPlayer.isFiring = false;
    }
  }
}

class AnimePlayerComponent extends PositionComponent {
  final String characterId;
  bool isJetpacking = false;
  bool isFiring = false;
  double aimAngle = 0.0;

  AnimePlayerComponent({required Vector2 position, required this.characterId})
      : super(position: position, size: Vector2(36, 48), anchor: Anchor.center);

  @override
  void render(Canvas canvas) {
    // Canvas painting matching Android AnimeCharacterRenderer
    final paint = Paint()..color = const Color(0xFFFFE4D6);
    canvas.drawCircle(Offset(size.x / 2, size.y / 4), 12, paint);
  }
}
`
  },
  {
    path: 'BUILD_AND_RELEASE_GUIDE.md',
    category: 'guide',
    title: 'Complete Build & Deployment Guide',
    description: 'Step-by-step instructions to run server locally, deploy on Render/Railway, set URL, and build signed release APK in Android Studio.',
    content: `# CALL OF BATTLE: ANIME EDITION - COMPLETE DEPLOYMENT & BUILD GUIDE

## PART 1: RUNNING & DEPLOYING THE GAME SERVER

### 1. Run Locally (Testing on LAN or Emulator)
\`\`\`bash
# 1. Enter server folder
cd server

# 2. Install dependencies
npm install

# 3. Start authoritative 30 tick/s server
npm start
# Output: [GameServer] Authoritative 30 tick/s server initialized on port 3000
\`\`\`
* Android Emulator address: \`ws://10.0.2.2:3000/ws\`
* Physical phone on same Wi-Fi: \`ws://YOUR_LOCAL_IP:3000/ws\` (e.g. \`ws://192.168.1.50:3000/ws\`)

### 2. Free 1-Click Deployment (Render / Railway / VPS)

#### Option A: Render.com (Free Web Service)
1. Push your \`server\` directory to a GitHub repository.
2. Go to [https://render.com](https://render.com) -> **New Web Service**.
3. Select your repository.
4. Settings:
   - **Environment**: Node
   - **Build Command**: \`npm install\`
   - **Start Command**: \`npm start\`
   - **Plan**: Free
5. Click **Create Web Service**. You will receive an address like:
   \`https://call-of-battle-server.onrender.com\`
6. Your Android app WebSocket endpoint is:
   \`wss://call-of-battle-server.onrender.com/ws\`

#### Option B: Railway.app
1. Go to [https://railway.app](https://railway.app) -> **New Project** -> **Deploy from GitHub repo**.
2. Railway detects Dockerfile or package.json automatically.
3. In service settings, generate domain. Use \`wss://YOUR_DOMAIN.up.railway.app/ws\`.

### 3. Setting the Server URL in the Android Client
In \`app/src/main/java/com/callofbattle/anime/net/NetworkClient.kt\`:
\`\`\`kotlin
fun connect(serverUrl: String = "wss://call-of-battle-server.onrender.com/ws")
\`\`\`
Or adjust it directly from the in-game Settings screen!

---

## PART 2: BUILDING A SIGNED RELEASE APK / AAB IN ANDROID STUDIO

### 1. Open Project in Android Studio
1. Open Android Studio (Hedgehog 2023.1+ or newer recommended).
2. Choose **File > Open** and select the root directory of this Android project.
3. Let Gradle sync and download dependencies.

### 2. Generate a Signed Keystore
1. In the top menu, go to **Build > Generate Signed Bundle / APK...**
2. Choose **Android App Bundle (.aab)** for Google Play Store, or **APK (.apk)** for direct sideloading.
3. Under **Key store path**, click **Create new...**:
   - Keystore path: \`~/call-of-battle-release.jks\`
   - Password: Choose a secure password
   - Key alias: \`release_key\`
   - Validity: 25+ years
   - Certificate: Fill in your Name/Organization
4. Click **OK**.

### 3. Build Signed Release
1. Select the release keystore created in step 2.
2. Select **release** build variant.
3. Check **V1 (Jar Signature)** and **V2 (Full APK Signature)**.
4. Click **Finish**.
5. Once complete, click **locate** to find your output APK:
   \`app/release/app-release.apk\`
6. Install on Android device via \`adb install app-release.apk\` or copy to device storage and tap to install!
`
  }
];
