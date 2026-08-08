#!/bin/bash

# Lấy tham số truyền vào làm message commit, nếu không có thì dùng mặc định
msg=$1
if [ -z "$msg" ]; then
  msg="Update code"
fi

echo "========================================"
echo "Adding files to Git..."
echo "========================================"
git add .

echo ""
echo "========================================"
echo "Committing changes with message: $msg"
echo "========================================"
git commit -m "$msg"

echo ""
echo "========================================"
echo "Pushing to Github..."
echo "========================================"
git push

echo ""
echo "========================================"
echo "Push Completed Successfully!"
echo "========================================"
