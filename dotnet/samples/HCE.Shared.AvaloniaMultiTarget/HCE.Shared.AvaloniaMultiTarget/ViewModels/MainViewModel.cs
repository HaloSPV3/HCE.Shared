using CommunityToolkit.Mvvm.ComponentModel;

namespace HCE.Shared.AvaloniaMultiTarget.ViewModels;

public partial class MainViewModel : ViewModelBase
{
    [ObservableProperty]
    private string _greeting = "Welcome to Avalonia!";
}
