# Run this yourself in PowerShell. Input is hidden; the key is never printed.
$secureKey = Read-Host 'Nebius API key (hidden)' -AsSecureString
$keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
try {
    $keyValue = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)
    if ([string]::IsNullOrWhiteSpace($keyValue) -or $keyValue -match '\s') {
        throw 'The key must be nonempty and contain no whitespace.'
    }
    [Environment]::SetEnvironmentVariable('NEBIUS_API_KEY', $keyValue, 'User')
    $env:NEBIUS_API_KEY = $keyValue
    Write-Output 'NEBIUS_API_KEY configured for this shell and the Windows user environment. No key was printed.'
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
    $keyValue = $null
    $secureKey.Dispose()
}
