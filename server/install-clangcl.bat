@echo off
echo 🔧 Installing Missing ClangCL Build Tools
echo =========================================

echo.
echo The error shows: "The build tools for ClangCL (Platform Toolset = 'ClangCL') cannot be found"
echo.
echo Solution: Install ClangCL build tools in Visual Studio
echo.

echo 1. Opening Visual Studio Installer...
start "" "C:\Program Files (x86)\Microsoft Visual Studio\Installer\vs_installer.exe"

echo.
echo 2. In Visual Studio Installer:
echo    - Click "Modify" on "Build Tools for Visual Studio 2022"
echo    - Go to "Individual components" tab
echo    - Search for "Clang" and check:
echo      ✓ C++ Clang Compiler for Windows (12.0.0)
echo      ✓ C++ Clang-cl for v143 build tools (x64/x86)
echo      ✓ MSBuild support for LLVM (clang-cl) toolset
echo.
echo 3. Also ensure these are checked:
echo    ✓ Windows 11 SDK (10.0.22621.0) or latest
echo    ✓ MSVC v143 - VS 2022 C++ x64/x86 build tools (Latest)
echo    ✓ CMake tools for Visual Studio
echo.
echo 4. Click "Modify" and wait for installation
echo.

echo After installation, run:
echo npm cache clean --force
echo npm install sqlite3 sequelize-typescript @types/sqlite3
echo.
pause