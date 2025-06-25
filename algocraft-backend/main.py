class Solution:
    def isPalindrome(self,s):
        """
        :type s: str
        :rtype: Any
        """
        # Write your code here
        return s==s[::-1]

if __name__ == "__main__":
    s = input()
    obj = Solution()
    print(obj.isPalindrome(s))