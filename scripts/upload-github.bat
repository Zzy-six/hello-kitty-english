@echo off
rem ============================================================
rem  一键上传 GitHub（需要电脑上登录过 GitHub 一次）
rem  步骤：双击本脚本 → 按提示登录/授权 GitHub → 等待推送完成
rem ============================================================
chcp 65001 >nul
cd /d "%~dp0.."

echo.
echo  [1/2] 检查本地是否为 git 仓库……
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
  echo  ! 当前目录不是 git 仓库，请确认已解压完整的项目文件夹。
  pause
  exit /b 1
)

echo  [2/2] 推送到 GitHub……
echo  （第一次会弹出登录窗口：选择 GitHub 账号并授权即可，之后都不用再输）
echo.
git remote add origin https://github.com/Zzy-six/hello-kitty-english.git 2>nul
git push -u origin --all
if errorlevel 1 (
  echo.
  echo  ------------------------------------------------
  echo  ! 推送失败了，常见原因：
  echo    1. 仓库还没创建：请用浏览器打开 https://github.com/new
  echo       名称填 hello-kitty-english，选 Public，点 Create repository
  echo       然后重新双击本脚本即可。
  echo    2. 弹窗登录时点了取消：重新双击本脚本再试。
  echo    3. 网络问题：确认电脑能访问 github.com 后重试。
  echo  ------------------------------------------------
) else (
  echo.
  echo  ✔ 上传完成！
  echo    代码地址：https://github.com/Zzy-six/hello-kitty-english
  echo    下一步在仓库网页右上角 Settings - Pages，Source 选 main 分支保存，
  echo    1~2 分钟后手机就能访问：
  echo    https://Zzy-six.github.io/hello-kitty-english/
)
pause
